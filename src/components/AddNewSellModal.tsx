import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { HiOutlineArrowTrendingDown, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import DateInput from "./DateInput";
import AssetSearchSelect from "./AssetSearchSelect";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import CurrencyService from "../services/CurrencyService";
import { emptySell, type SellForm } from "../forms/SellForm";
import type { AssetPriceResponse } from "../responses/AssetPriceResponse";

interface AddNewSellModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  ownedCompanies: string[];
  onSuccess: (sell: AssetSellResponse) => void;
}

const AddNewSellModal: React.FC<AddNewSellModalProps> = (props: AddNewSellModalProps) => {
  const [form, setForm] = useState<SellForm>(emptySell());
  const [saving, setSaving] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const [availableShares, setAvailableShares] = useState<number | null>(null);
  const [availableSharesLoading, setAvailableSharesLoading] = useState<boolean>(false);
  const [avgBuyPrice, setAvgBuyPrice] = useState<number | null>(null);
  const portfolioService: PortfolioService = PortfolioService.getInstance();
  const assetService: AssetService = AssetService.getInstance();
  const currencyService: CurrencyService = CurrencyService.getInstance();

  useEffect(() => {
    assetService.getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  // Fetch available shares when asset or date changes
  useEffect(() => {
    if (!form.assetId || !form.date) {
      setAvailableShares(null);
      return;
    }

    let cancelled = false;
    setAvailableSharesLoading(true);

    portfolioService.getAvailableShares(props.portfolioId, form.assetId, form.date)
      .then((n) => { if (!cancelled) setAvailableShares(n); })
      .catch(() => { if (!cancelled) setAvailableShares(null); })
      .finally(() => { if (!cancelled) setAvailableSharesLoading(false); });

    return () => { cancelled = true; };
  }, [form.assetId, form.date]);

  // Fetch average buy price when asset, date or currency changes
  useEffect(() => {
    if (!form.assetId || !form.date || !form.currencyId) {
      setAvgBuyPrice(null);
      return;
    }

    let cancelled = false;
    portfolioService.getAverageBuyPrice(props.portfolioId, form.assetId, form.date)
      .then((avg) => { if (!cancelled) setAvgBuyPrice(avg); })
      .catch(() => { if (!cancelled) setAvgBuyPrice(null); });

    return () => { cancelled = true; };
  }, [form.assetId, form.date, form.currencyId]);

  // Fetch raw price (in the asset's base currency) when asset or date changes
  useEffect(() => {
    if (!form.assetId || !form.date) {
      setFetchedPrice(null);
      return;
    }

    let cancelled = false;
    setPriceLoading(true);
    setAutoFilled(false);

    (async () => {
      try {
        const result: AssetPriceResponse | null = await assetService.getAssetPrice(form.assetId, form.date);
        if (!cancelled) {
          setFetchedPrice(result ? result.price : null);
        }
      }
      finally {
        if (!cancelled) {
          setPriceLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [form.assetId, form.date]);

  // Convert price to the selected currency and fill the price per share field
  useEffect(() => {
    if (fetchedPrice == null || !form.currencyId) return;

    const selectedAsset: Asset | undefined = assets.find((a) => a.id === form.assetId);
    const baseCurrencyCode: string | undefined = props.currencies.find((c) => c.uuid === selectedAsset?.baseCurrencyId)?.currencyName;
    const targetCurrencyCode: string | undefined = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName;

    const applyPrice = (price: number): void => {
      setForm((f) => ({ ...f, pricePerShare: String(parseFloat(price.toFixed(4))) }));
      setAutoFilled(true);
    };

    if (!baseCurrencyCode || !targetCurrencyCode || baseCurrencyCode === targetCurrencyCode) {
      applyPrice(fetchedPrice);
      return;
    }

    let cancelled = false;
    setPriceLoading(true);

    currencyService.convertPrice(baseCurrencyCode, targetCurrencyCode, fetchedPrice)
      .then((converted) => { if (!cancelled) { applyPrice(converted); } })
      .catch(() => { if (!cancelled) { applyPrice(fetchedPrice); } })
      .finally(() => { if (!cancelled) { setPriceLoading(false); } });

    return () => { cancelled = true; };
  }, [fetchedPrice, form.currencyId, form.assetId]);

  useEffect(() => {
    if (props.currencies.length === 0) return;
    const eur: string = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
    setForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
  }, [props.currencies]);

  // Auto-compute capital gain when avgBuyPrice, pricePerShare or shares changes
  useEffect(() => {
    if (avgBuyPrice == null) return;
    const shares: number = parseFloat(form.shares);
    const price: number = parseFloat(form.pricePerShare);
    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) return;
    const gain: number = parseFloat(((price - avgBuyPrice) * shares).toFixed(2));
    setForm((f) => ({ ...f, capitalGain: String(gain) }));
  }, [avgBuyPrice, form.shares, form.pricePerShare]);

  useEffect(() => {
    const dialog: HTMLDialogElement | null = props.dialogRef.current;
    if (!dialog) return;

    const handleShow = () => {
      const eur: string = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
      setForm({ ...emptySell(), currencyId: eur });
      setFetchedPrice(null);
      setAutoFilled(false);
      setAvailableShares(null);
      setAvgBuyPrice(null);
    };

    dialog.addEventListener("show", handleShow);
    return () => dialog.removeEventListener("show", handleShow);
  }, [props.dialogRef, props.currencies]);

  const refreshAvailableShares = () => {
    if (!form.assetId || !form.date) return;
    portfolioService.getAvailableShares(props.portfolioId, form.assetId, form.date)
      .then(setAvailableShares)
      .catch(() => {});
  };

  const handleAdd = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId || !form.shares || !form.pricePerShare) return;

    const shares: number = parseFloat(form.shares);
    const price: number = parseFloat(form.pricePerShare);
    if (shares <= 0 || price <= 0) return;

    setSaving(true);
    try {
      const createdSell: AssetSellResponse = await portfolioService.addAssetSell({
        portfolioId: props.portfolioId,
        assetId: form.assetId || undefined,
        sellCurrencyId: form.currencyId,
        gainCurrencyId: form.currencyId,
        sellDate: form.date,
        assetSellAmount: parseFloat((shares * price).toFixed(2)),
        assetSellShare: shares,
        assetSellGain: form.capitalGain ? parseFloat(form.capitalGain) : undefined,
      });

      props.onSuccess(createdSell);
      props.dialogRef.current?.close();
      toast.success("Sell added.");
    }
    catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_SHARES") {
        toast.error("Not enough shares at this date.");
        refreshAvailableShares();
      }
      else {
        toast.error("Failed to add entry.");
      }
    }
    finally {
      setSaving(false);
    }
  };

  // Only show assets the user actually owns in this portfolio
  const ownedAssets: Asset[] = assets.filter((a) => {
    const name: string = a.officialName ?? a.tickerName ?? "";
    return name !== "" && props.ownedCompanies.includes(name);
  });

  const currencyName: string = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";
  const enteredShares: number = parseFloat(form.shares) || 0;
  const sharesExceeded: boolean = availableShares !== null && enteredShares > 0 && enteredShares > availableShares;
  const hasNoShares: boolean = availableShares !== null && availableShares === 0;

  const computedTotal: number | null = (() => {
    const s = parseFloat(form.shares);
    const p = parseFloat(form.pricePerShare);
    return s > 0 && p > 0 ? parseFloat((s * p).toFixed(2)) : null;
  })();

  const isDisabled: boolean = saving || !form.date || !form.assetId || !form.currencyId
    || !form.shares || !form.pricePerShare
    || hasNoShares
    || sharesExceeded;

  return (
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${tabAccent.SELLS.icon} flex items-center justify-center`}>
              <HiOutlineArrowTrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">New sell</h3>
          </div>
          <button
            onClick={() => props.dialogRef.current?.close()}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>Date</label>
            <DateInput
              value={form.date}
              onChange={(value) => setForm((f) => ({ ...f, date: value }))}
              portalTarget={props.dialogRef.current}
            />
          </div>

          <div>
            <label className={labelCls}>Asset</label>
            <AssetSearchSelect
              assets={ownedAssets}
              value={form.assetId}
              onChange={(assetId) => setForm((f) => ({ ...f, assetId }))}
              portalTarget={props.dialogRef.current}
            />
            {form.assetId && form.date && (
              <div className="mt-1.5">
                {availableSharesLoading ? (
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <span className="loading loading-spinner loading-xs" /> Computing…
                  </span>
                ) : availableShares !== null ? (
                  <span className={`text-[11px] font-medium ${availableShares === 0 ? "text-red-500" : "text-emerald-600"}`}>
                    {availableShares} shares available
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Shares — always required for sell (amount mode removed intentionally) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Number of shares</label>
              {availableShares !== null && (
                <span className="text-[11px] text-gray-400">max {availableShares}</span>
              )}
            </div>
            <input
              type="number"
              min={0}
              max={availableShares ?? undefined}
              value={form.shares}
              onChange={(e) => setForm((f) => ({ ...f, shares: e.target.value }))}
              placeholder="0"
              className={`${inputCls} ${sharesExceeded ? "border-red-400 focus:ring-red-300" : ""}`}
            />
            {sharesExceeded && (
              <p className="text-[11px] text-red-500 mt-1">
                Only {availableShares} shares available at this date
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Price per share</label>
                {priceLoading && (
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <span className="loading loading-spinner loading-xs" /> Fetching…
                  </span>
                )}
                {!priceLoading && autoFilled && (
                  <span className="text-[11px] text-purple-500 font-medium">Auto-filled</span>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={form.pricePerShare}
                onChange={(e) => {
                  setAutoFilled(false);
                  setForm((f) => ({ ...f, pricePerShare: e.target.value }));
                }}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div className="w-32">
              <label className={labelCls}>Currency</label>
              <select
                value={form.currencyId}
                onChange={(e) => setForm((f) => ({ ...f, currencyId: e.target.value }))}
                className={inputCls}
              >
                <option value="">Currency</option>
                {props.currencies.map((currency) => (
                  <option key={currency.uuid} value={currency.uuid}>{currency.currencyName}</option>
                ))}
              </select>
            </div>
          </div>

          {computedTotal != null && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-medium text-gray-900">{computedTotal} {currencyName}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Capital gain</label>
              {avgBuyPrice != null && (
                <span className="text-[11px] text-purple-500 font-medium">Auto — avg cost {parseFloat(avgBuyPrice.toFixed(4))} {currencyName}</span>
              )}
            </div>
            <input
              type="number"
              value={form.capitalGain}
              onChange={(e) => setForm((f) => ({ ...f, capitalGain: e.target.value }))}
              placeholder="0.00"
              className={`${inputCls} ${avgBuyPrice != null ? "bg-purple-50 border-purple-200" : ""}`}
            />
          </div>

          {hasNoShares && (
            <p className="text-[11px] text-red-500">
              You don't own any shares of this asset on this date.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => props.dialogRef.current?.close()}
              className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={isDisabled}
              className={`flex-1 py-2.5 text-sm text-white ${tabAccent.SELLS.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}
            >
              {saving ? <span className="loading loading-spinner loading-xs text-white" /> : "Add"}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default AddNewSellModal;
