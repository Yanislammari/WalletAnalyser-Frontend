import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { HiOutlineArrowTrendingUp, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import InputModeToggle from "./InputModeToggle";
import DateInput from "./DateInput";
import AssetSearchSelect from "./AssetSearchSelect";
import AddCustomAssetModal from "./AddCustomAssetModal";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import CurrencyService from "../services/CurrencyService";
import { emptyBuy, type BuyForm } from "../forms/BuyForm";
import { InputMode } from "../enums/InputMode";
import type { AssetPriceResponse } from "../responses/AssetPriceResponse";

interface AddNewBuyModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (buy: AssetBuyResponse) => void;
}

const AddNewBuyModal: React.FC<AddNewBuyModalProps> = (props: AddNewBuyModalProps) => {
  const [form, setForm] = useState<BuyForm>(emptyBuy());
  const [saving, setSaving] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const customAssetDialogRef = useRef<HTMLDialogElement>(null);
  const portfolioService: PortfolioService = PortfolioService.getInstance();
  const assetService: AssetService = AssetService.getInstance();
  const currencyService: CurrencyService = CurrencyService.getInstance();

  useEffect(() => {
    assetService.getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  // Fetch raw price (in the asset's base currency) when asset or date changes
  useEffect(() => {
    if (!form.assetId || !form.date) {
      setFetchedPrice(null);
      return;
    }

    let cancelled: boolean = false;
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

  // Convert price to the selected currency and fill the form field
  useEffect(() => {
    if (fetchedPrice == null || !form.currencyId) {
      return;
    }

    const selectedAsset: Asset | undefined = assets.find((a) => a.id === form.assetId);
    const baseCurrencyCode: string | undefined = props.currencies.find((c) => c.uuid === selectedAsset?.baseCurrencyId)?.currencyName;
    const targetCurrencyCode: string | undefined = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName;

    const applyPrice = (price: number): void => {
      if (form.inputMode === InputMode.AMOUNT) {
        setForm((f) => ({ ...f, amount: String(parseFloat(price.toFixed(4))) }));
      }
      else {
        setForm((f) => ({ ...f, pricePerShare: String(parseFloat(price.toFixed(4))) }));
      }
      setAutoFilled(true);
    };

    if (!baseCurrencyCode || !targetCurrencyCode || baseCurrencyCode === targetCurrencyCode) {
      applyPrice(fetchedPrice);
      return;
    }

    let cancelled: boolean = false;
    setPriceLoading(true);

    currencyService.convertPrice(baseCurrencyCode, targetCurrencyCode, fetchedPrice)
      .then((converted) => { if (!cancelled) { applyPrice(converted); } })
      .catch(() => { if (!cancelled) { applyPrice(fetchedPrice); } })
      .finally(() => { if (!cancelled) { setPriceLoading(false); } });

    return () => { cancelled = true; };
  }, [fetchedPrice, form.currencyId, form.assetId, form.inputMode]);

  useEffect(() => {
    if (props.currencies.length === 0) {
      return;
    }

    const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
    setForm((form) => ({ ...form, currencyId: form.currencyId || eur }));
  }, [props.currencies]);

  useEffect(() => {
    const dialog: HTMLDialogElement | null = props.dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleShow = () => {
      const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
      setForm({ ...emptyBuy(), currencyId: eur });
      setFetchedPrice(null);
      setAutoFilled(false);
    };

    dialog.addEventListener("show", handleShow);
    return () => dialog.removeEventListener("show", handleShow);
  }, [props.dialogRef, props.currencies]);

  const handleAdd = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId) {
      return;
    }

    setSaving(true);
    try {
      const createdBuy: AssetBuyResponse = await portfolioService.addAssetBuy({
        portfolioId: props.portfolioId,
        assetId: form.assetId || undefined,
        buyCurrencyId: form.currencyId,
        buyDate: form.date,
        assetBuyAmount: form.inputMode === InputMode.AMOUNT && form.amount ? parseFloat(form.amount) : undefined,
        assetBuyShare: form.inputMode !== InputMode.AMOUNT && form.shares ? parseFloat(form.shares) : undefined,
        assetBuyPricePerShare: form.inputMode !== InputMode.AMOUNT && form.pricePerShare ? parseFloat(form.pricePerShare) : undefined,
      });

      props.onSuccess(createdBuy);
      props.dialogRef.current?.close();
      toast.success("Buy added.");
    }
    catch {
      toast.error("Failed to add entry.");
    }
    finally {
      setSaving(false);
    }
  };

  const currencyName: string = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";
  const isAmountMode: boolean = form.inputMode === InputMode.AMOUNT;

  const computedTotal: number | null = (() => {
    const shares: number = parseFloat(form.shares);
    const price: number = parseFloat(form.pricePerShare);

    return !isAmountMode && shares > 0 && price > 0 ? parseFloat((shares * price).toFixed(2)) : null;
  })();

  const isDisabled: boolean = saving || !form.date || !form.assetId || !form.currencyId || (isAmountMode ? !form.amount : (!form.shares || !form.pricePerShare));

  return (
    <>
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${tabAccent.BUYS.icon} flex items-center justify-center`}>
              <HiOutlineArrowTrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">New buy</h3>
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
              onAddCustomAsset={() => customAssetDialogRef.current?.showModal()}
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
                      setForm((form) => ({ ...form, pricePerShare: e.target.value }));
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
            </>
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
              className={`flex-1 py-2.5 text-sm text-white ${tabAccent.BUYS.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}
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

    <AddCustomAssetModal
      dialogRef={customAssetDialogRef}
      onAssetCreated={(newAsset) => {
        setAssets((prev) => [...prev, newAsset]);
        setForm((f) => ({ ...f, assetId: newAsset.id }));
      }}
    />
    </>
  );
}

export default AddNewBuyModal;
