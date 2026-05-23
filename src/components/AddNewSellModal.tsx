import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { HiOutlineArrowTrendingDown, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import InputModeToggle from "./InputModeToggle";
import DateInput from "./DateInput";
import AssetSearchSelect from "./AssetSearchSelect";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import { emptySell, type SellForm } from "../forms/SellForm";
import { InputMode } from "../enums/InputMode";
import type { AssetPriceResponse } from "../responses/AssetPriceResponse";

interface AddNewSellModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (sell: AssetSellResponse) => void;
}

const AddNewSellModal: React.FC<AddNewSellModalProps> = (props: AddNewSellModalProps) => {
  const [form, setForm] = useState<SellForm>(emptySell());
  const [saving, setSaving] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceFetching, setPriceFetching] = useState<boolean>(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const portfolioService: PortfolioService = PortfolioService.getInstance();
  const assetService: AssetService = AssetService.getInstance();

  useEffect(() => {
    assetService.getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  useEffect(() => {
    if (!form.assetId || !form.date) {
      setFetchedPrice(null);
      return;
    }

    let cancelled = false;
    setPriceFetching(true);
    setAutoFilled(false);

    (async () => {
      try {
        const result: AssetPriceResponse | null = await assetService.getAssetPrice(form.assetId, form.date);
        if (cancelled) {
          return;
        }

        setFetchedPrice(result ? result.price : null);
      }
      finally {
        if (!cancelled) {
          setPriceFetching(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [form.assetId, form.date]);

  useEffect(() => {
    if (fetchedPrice == null) {
      return;
    }

    if (form.inputMode === InputMode.AMOUNT) {
      setForm((form) => ({ ...form, amount: String(fetchedPrice) }));
    }
    else {
      setForm((form) => ({ ...form, pricePerShare: String(fetchedPrice) }));
    }
    setAutoFilled(true);
  }, [fetchedPrice, form.inputMode]);

  useEffect(() => {
    if (props.currencies.length === 0) return;
    const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
    setForm((form) => ({ ...form, currencyId: form.currencyId || eur, gainCurrencyId: form.gainCurrencyId || eur }));
  }, [props.currencies]);

  useEffect(() => {
    const dialog: HTMLDialogElement | null = props.dialogRef.current;
    if (!dialog) return;

    const handleShow = () => {
      const eur: string = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
      setForm({ ...emptySell(), currencyId: eur, gainCurrencyId: eur });
      setFetchedPrice(null);
      setAutoFilled(false);
    };

    dialog.addEventListener("show", handleShow);
    return () => dialog.removeEventListener("show", handleShow);
  }, [props.dialogRef, props.currencies]);

  const handleAdd = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId) return;

    setSaving(true);
    try {
      const isAmountMode: boolean = form.inputMode === InputMode.AMOUNT;
      const shares: number | undefined = form.shares ? parseFloat(form.shares) : undefined;
      const price: number | undefined = form.pricePerShare ? parseFloat(form.pricePerShare) : undefined;

      const createdSell: AssetSellResponse = await portfolioService.addAssetSell({
        portfolioId: props.portfolioId,
        assetId: form.assetId || undefined,
        sellCurrencyId: form.currencyId,
        sellDate: form.date,
        assetSellAmount: isAmountMode && form.amount ? parseFloat(form.amount) : (shares && price ? parseFloat((shares * price).toFixed(2)) : undefined),
        assetSellShare: !isAmountMode && shares ? shares : undefined,
        assetSellGain: form.capitalGain ? parseFloat(form.capitalGain) : undefined,
      });

      props.onSuccess(createdSell);
      props.dialogRef.current?.close();
      toast.success("Sell added.");
    }
    catch {
      toast.error("Failed to add entry.");
    }
    finally {
      setSaving(false);
    }
  };

  const isAmountMode: boolean = form.inputMode === InputMode.AMOUNT;
  const currencyName: string = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";

  const computedTotal: number | null = (() => {
    const shares: number = parseFloat(form.shares);
    const price: number = parseFloat(form.pricePerShare);
    return !isAmountMode && shares > 0 && price > 0 ? parseFloat((shares * price).toFixed(2)) : null;
  })();

  const isDisabled: boolean = saving || !form.date || !form.assetId || !form.currencyId
    || (isAmountMode ? !form.amount : (!form.shares || !form.pricePerShare));

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
              assets={assets}
              value={form.assetId}
              onChange={(assetId) => setForm((f) => ({ ...f, assetId }))}
              portalTarget={props.dialogRef.current}
            />
          </div>

          <div>
            <label className={`${labelCls} mb-1.5`}>Enter by</label>
            <InputModeToggle
              value={form.inputMode}
              onChange={(value) => setForm((f) => ({ ...f, inputMode: value }))}
            />
          </div>

          {isAmountMode ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>Amount</label>
                  {priceFetching && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span className="loading loading-spinner loading-xs" /> Fetching…
                    </span>
                  )}
                  {!priceFetching && autoFilled && (
                    <span className="text-[11px] text-purple-500 font-medium">Auto-filled</span>
                  )}
                </div>
                <input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => {
                    setAutoFilled(false);
                    setForm((f) => ({ ...f, amount: e.target.value }));
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
          ) : (
            <>
              <div>
                <label className={labelCls}>Number of shares</label>
                <input
                  type="number"
                  min={0}
                  value={form.shares}
                  onChange={(e) => setForm((f) => ({ ...f, shares: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>Price per share</label>
                  {priceFetching && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span className="loading loading-spinner loading-xs" /> Fetching…
                    </span>
                  )}
                  {!priceFetching && autoFilled && (
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

              {computedTotal != null && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-gray-900">{computedTotal} {currencyName}</span>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Capital gain</label>
              <input
                type="number"
                value={form.capitalGain}
                onChange={(e) => setForm((f) => ({ ...f, capitalGain: e.target.value }))}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div className="w-32">
              <label className={labelCls}>Currency</label>
              <select
                value={form.gainCurrencyId}
                onChange={(e) => setForm((f) => ({ ...f, gainCurrencyId: e.target.value }))}
                className={inputCls}
              >
                <option value="">Currency</option>
                {props.currencies.map((currency) => (
                  <option key={currency.uuid} value={currency.uuid}>{currency.currencyName}</option>
                ))}
              </select>
            </div>
          </div>

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
