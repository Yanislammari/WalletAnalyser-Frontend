import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { HiOutlineArrowTrendingDown, HiOutlineLockClosed, HiOutlineXMark } from "react-icons/hi2";
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
import { InputMode } from "../enums/InputMode";
import { useAuth } from "../providers/AuthProvider";

interface AddNewSellModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  ownedCompanies: string[];
  onSuccess: (sell: AssetSellResponse) => void;
  editTransaction?: AssetSellResponse;
}

const AddNewSellModal: React.FC<AddNewSellModalProps> = (props) => {
  const isEditMode = !!props.editTransaction;
  const [form, setForm] = useState<SellForm>(emptySell());
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const [availableShares, setAvailableShares] = useState<number | null>(null);
  const [availableSharesLoading, setAvailableSharesLoading] = useState<boolean>(false);
  const [avgBuyPrice, setAvgBuyPrice] = useState<number | null>(null);
  const portfolioService = PortfolioService.getInstance();
  const assetService = AssetService.getInstance();
  const currencyService = CurrencyService.getInstance();
  const { isPro } = useAuth();
  const freeMinDate = !isPro
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined;

  // Fetch selected asset object to enable currency conversion
  useEffect(() => {
    if (!props.editTransaction?.assetId) { setSelectedAsset(null); return; }
    assetService.getAssetById(props.editTransaction.assetId).then(setSelectedAsset).catch(() => {});
  }, [props.editTransaction?.assetId]);

  // Pre-fill form immediately when editTransaction prop changes (avoids "show" event timing race)
  useEffect(() => {
    if (!props.editTransaction) return;
    const tx = props.editTransaction;
    setForm({
      date: tx.sellDate,
      assetId: tx.assetId ?? "",
      currencyId: tx.sellCurrencyId,
      inputMode: InputMode.SHARES,
      amount: tx.assetSellAmount != null ? String(tx.assetSellAmount) : "",
      shares: tx.assetSellShare != null ? String(tx.assetSellShare) : "",
      pricePerShare: (tx.assetSellAmount != null && tx.assetSellShare != null && tx.assetSellShare > 0)
        ? String(parseFloat((tx.assetSellAmount / tx.assetSellShare).toFixed(4)))
        : "",
      capitalGain: tx.assetSellGain != null ? String(tx.assetSellGain) : "",
      gainCurrencyId: tx.sellCurrencyId,
    });
    setFetchedPrice(null);
    setAutoFilled(false);
    setAvailableShares(null);
    setAvgBuyPrice(null);
  }, [props.editTransaction]);

  // Reset form to empty when opening in add mode
  useEffect(() => {
    const dialog = props.dialogRef.current;
    if (!dialog) return;
    const handleShow = () => {
      if (!props.editTransaction) {
        const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
        setForm({ ...emptySell(), currencyId: eur });
        setSelectedAsset(null);
        setFetchedPrice(null);
        setAutoFilled(false);
        setAvailableShares(null);
        setAvgBuyPrice(null);
      }
    };
    dialog.addEventListener("show", handleShow);
    return () => dialog.removeEventListener("show", handleShow);
  }, [props.dialogRef, props.currencies, props.editTransaction]);

  useEffect(() => {
    if (!isEditMode && props.currencies.length > 0) {
      const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
      setForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
    }
  }, [props.currencies, isEditMode]);

  // Available shares
  useEffect(() => {
    if (!form.assetId || !form.date) { setAvailableShares(null); return; }
    let cancelled = false;
    setAvailableSharesLoading(true);
    portfolioService.getAvailableShares(props.portfolioId, form.assetId, form.date)
      .then((n) => { if (!cancelled) setAvailableShares(n); })
      .catch(() => { if (!cancelled) setAvailableShares(null); })
      .finally(() => { if (!cancelled) setAvailableSharesLoading(false); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date]);

  // Average buy price
  useEffect(() => {
    if (!form.assetId || !form.date || !form.currencyId) { setAvgBuyPrice(null); return; }
    let cancelled = false;
    portfolioService.getAverageBuyPrice(props.portfolioId, form.assetId, form.date, form.currencyId)
      .then((avg) => { if (!cancelled) setAvgBuyPrice(avg); })
      .catch(() => { if (!cancelled) setAvgBuyPrice(null); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date, form.currencyId]);

  // Auto-fill price from Yahoo
  useEffect(() => {
    if (isEditMode || !form.assetId || !form.date) { setFetchedPrice(null); return; }
    let cancelled = false;
    setPriceLoading(true);
    setAutoFilled(false);
    assetService.getAssetPrice(form.assetId, form.date)
      .then((r: AssetPriceResponse | null) => { if (!cancelled) setFetchedPrice(r?.price ?? null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date, isEditMode]);

  useEffect(() => {
    if (fetchedPrice == null || !form.currencyId) return;
    const sel = selectedAsset;
    const baseCcy = props.currencies.find((c) => c.uuid === sel?.baseCurrencyId)?.currencyName;
    const tgtCcy  = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName;
    const apply = (price: number) => { setForm((f) => ({ ...f, pricePerShare: String(parseFloat(price.toFixed(4))) })); setAutoFilled(true); };
    if (!baseCcy || !tgtCcy || baseCcy === tgtCcy) { apply(fetchedPrice); return; }
    let cancelled = false;
    setPriceLoading(true);
    currencyService.convertPrice(baseCcy, tgtCcy, fetchedPrice)
      .then((v) => { if (!cancelled) apply(v); })
      .catch(() => { if (!cancelled) apply(fetchedPrice); })
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [fetchedPrice, form.currencyId, form.assetId]);

  // Capital gain — computed synchronously so it updates instantly when
  // pricePerShare, shares, or avgBuyPrice change (no effect timing issues).
  const computedCapitalGain = useMemo(() => {
    if (avgBuyPrice == null) return null;
    const shares = parseFloat(form.shares), price = parseFloat(form.pricePerShare);
    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) return null;
    return parseFloat(((price - avgBuyPrice) * shares).toFixed(2));
  }, [avgBuyPrice, form.shares, form.pricePerShare]);

  const handleSave = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId || !form.shares || !form.pricePerShare) return;
    const shares = parseFloat(form.shares), price = parseFloat(form.pricePerShare);
    if (shares <= 0 || price <= 0) return;
    setSaving(true);
    try {
      let result: AssetSellResponse;
      if (isEditMode && props.editTransaction) {
        result = await portfolioService.updateAssetSell(props.portfolioId, props.editTransaction.id, {
          sellCurrencyId:       form.currencyId,
          sellDate:             form.date,
          assetSellShare:       shares,
          assetSellPricePerShare: price,
        });
        toast.success("Sell updated.");
      } else {
        result = await portfolioService.addAssetSell({
          portfolioId:     props.portfolioId,
          assetId:         form.assetId || undefined,
          sellCurrencyId:  form.currencyId,
          gainCurrencyId:  form.currencyId,
          sellDate:        form.date,
          assetSellAmount: parseFloat((shares * price).toFixed(2)),
          assetSellShare:  shares,
          assetSellGain:   computedCapitalGain ?? undefined,
        });
        toast.success("Sell added.");
      }
      props.onSuccess(result);
      props.dialogRef.current?.close();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_SHARES")
        toast.error("Not enough shares at this date.");
      else
        toast.error(isEditMode ? "Failed to update sell." : "Failed to add sell.");
      if (!isEditMode && form.assetId && form.date) {
        portfolioService.getAvailableShares(props.portfolioId, form.assetId, form.date)
          .then(setAvailableShares).catch(() => {});
      }
    } finally {
      setSaving(false);
    }
  };

  const currencyName = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";
  const sharesIsZero = form.shares !== "" && parseFloat(form.shares) <= 0;
  const sellPriceIsZero = form.pricePerShare !== "" && parseFloat(form.pricePerShare) <= 0;
  const enteredShares = parseFloat(form.shares) || 0;
  // In edit mode, add back the current sell's shares to available (they'd be freed if we change)
  const effectiveAvailable = isEditMode && availableShares !== null
    ? availableShares + (props.editTransaction?.assetSellShare ?? 0)
    : availableShares;
  const sharesExceeded = effectiveAvailable !== null && enteredShares > 0 && enteredShares > effectiveAvailable;
  const hasNoShares = effectiveAvailable !== null && effectiveAvailable === 0;
  const computedTotal: number | null = (() => {
    const s = parseFloat(form.shares), p = parseFloat(form.pricePerShare);
    return s > 0 && p > 0 ? parseFloat((s * p).toFixed(2)) : null;
  })();
  const isDisabled = saving || !form.date || !form.assetId || !form.currencyId || !form.shares || !form.pricePerShare || hasNoShares || sharesExceeded || sharesIsZero || sellPriceIsZero;

  return (
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${tabAccent.SELLS.icon} flex items-center justify-center`}>
              <HiOutlineArrowTrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">{isEditMode ? "Edit sell" : "New sell"}</h3>
          </div>
          <button onClick={() => props.dialogRef.current?.close()} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>Date</label>
            <DateInput value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} portalTarget={props.dialogRef.current} minDate={freeMinDate} />
              {!isPro && (
                <p className="text-[11px] text-amber-600 mt-1">Free plan: dates limited to the last 12 months. <a href="/home/subscription" className="underline">Upgrade to Pro</a> for full history.</p>
              )}
          </div>

          {!isEditMode ? (
            <div>
              <label className={labelCls}>Asset</label>
              <AssetSearchSelect
                selectedAsset={selectedAsset}
                onSelect={(asset) => {
                  setSelectedAsset(asset);
                  setForm((f) => ({ ...f, assetId: asset?.id ?? "" }));
                }}
                fetchAssets={(search, offset, limit) =>
                  assetService.getAssetsPaginated(search, offset, limit)
                }
                portalTarget={props.dialogRef.current}
              />
              {form.assetId && form.date && (
                <div className="mt-1.5">
                  {availableSharesLoading
                    ? <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="loading loading-spinner loading-xs" /> Computing…</span>
                    : availableShares !== null
                      ? <span className={`text-[11px] font-medium ${availableShares === 0 ? "text-red-500" : "text-emerald-600"}`}>{availableShares} shares available</span>
                      : null}
                </div>
              )}
            </div>
          ) : (
            <div>
              {props.editTransaction?.companyName && (
                <div className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium mb-2">
                  {props.editTransaction.companyName}
                </div>
              )}
              {form.date && (
                <div className="mt-1">
                  {availableSharesLoading
                    ? <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="loading loading-spinner loading-xs" /> Computing…</span>
                    : effectiveAvailable !== null
                      ? <span className={`text-[11px] font-medium ${effectiveAvailable === 0 ? "text-red-500" : "text-emerald-600"}`}>{effectiveAvailable} shares available</span>
                      : null}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Number of shares</label>
              {effectiveAvailable !== null && <span className="text-[11px] text-gray-400">max {effectiveAvailable}</span>}
            </div>
            <input type="number" min={0} max={effectiveAvailable ?? undefined} value={form.shares}
              onChange={(e) => setForm((f) => ({ ...f, shares: e.target.value }))}
              placeholder="0" className={`${inputCls} ${sharesExceeded || sharesIsZero ? "border-red-400 focus:ring-red-300" : ""}`} />
            {sharesExceeded && <p className="text-[11px] text-red-500 mt-1">Only {effectiveAvailable} shares available at this date</p>}
            {sharesIsZero && <p className="text-[11px] text-red-500 mt-1">Number of shares must be greater than 0</p>}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Price per share</label>
                {priceLoading && <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="loading loading-spinner loading-xs" /> Fetching…</span>}
                {!priceLoading && autoFilled && <span className="text-[11px] text-purple-500 font-medium">Auto-filled</span>}
              </div>
              <input type="number" min={0} value={form.pricePerShare}
                onChange={(e) => { setAutoFilled(false); setForm((f) => ({ ...f, pricePerShare: e.target.value })); }}
                placeholder="0.00" className={`${inputCls} ${sellPriceIsZero ? "border-red-400 focus:ring-red-300" : ""}`} />
              {sellPriceIsZero && <p className="text-[11px] text-red-500 mt-1">Price must be greater than 0</p>}
            </div>
            <div className="w-32">
              <label className={labelCls}>Currency</label>
              <select value={form.currencyId} onChange={(e) => setForm((f) => ({ ...f, currencyId: e.target.value }))} className={inputCls}>
                <option value="">Currency</option>
                {props.currencies.map((c) => <option key={c.uuid} value={c.uuid}>{c.currencyName}</option>)}
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
              <div className="flex items-center gap-1.5">
                <label className={labelCls}>Capital gain</label>
                <HiOutlineLockClosed size={11} className="text-gray-300 mt-px" />
              </div>
              {avgBuyPrice != null
                ? <span className="text-[11px] text-purple-500 font-medium">avg cost {parseFloat(avgBuyPrice.toFixed(4))} {currencyName}</span>
                : <span className="text-[11px] text-gray-300">auto-calculated</span>
              }
            </div>
            <div className={`flex items-center px-3 h-10 rounded-xl border text-sm ${
              avgBuyPrice != null
                ? "bg-purple-50 border-purple-100 text-purple-700 font-medium"
                : "bg-gray-50 border-gray-100 text-gray-300 italic"
            }`}>
              {computedCapitalGain != null ? `${computedCapitalGain} ${currencyName}` : "Will be computed automatically"}
            </div>
          </div>

          {hasNoShares && <p className="text-[11px] text-red-500">You don't own any shares of this asset on this date.</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={() => props.dialogRef.current?.close()} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isDisabled}
              className={`flex-1 py-2.5 text-sm text-white ${tabAccent.SELLS.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}>
              {saving ? <span className="loading loading-spinner loading-xs text-white" /> : isEditMode ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  );
};

export default AddNewSellModal;
