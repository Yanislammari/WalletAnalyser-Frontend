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
import { useAuth } from "../providers/AuthProvider";

interface AddNewBuyModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (buy: AssetBuyResponse) => void;
  editTransaction?: AssetBuyResponse;
}

const AddNewBuyModal: React.FC<AddNewBuyModalProps> = (props) => {
  const isEditMode = !!props.editTransaction;
  const [form, setForm] = useState<BuyForm>(emptyBuy());
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const customAssetDialogRef = useRef<HTMLDialogElement>(null);
  // Skip the price fetch triggered by the initial pre-fill (we already have the existing price)
  const skipNextPriceFetch = useRef(false);
  const portfolioService = PortfolioService.getInstance();
  const assetService = AssetService.getInstance();
  const currencyService = CurrencyService.getInstance();
  const { isPro } = useAuth();
  const freeMinDate = !isPro
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined;

  // When entering edit mode, fetch the asset object so currency conversion works
  useEffect(() => {
    if (!props.editTransaction?.assetId) { setSelectedAsset(null); return; }
    assetService.getAssetById(props.editTransaction.assetId).then(setSelectedAsset).catch(() => {});
  }, [props.editTransaction?.assetId]);

  // Pre-fill form immediately when editTransaction prop changes (avoids "show" event timing race)
  useEffect(() => {
    if (!props.editTransaction) return;
    const tx = props.editTransaction;
    const mode = tx.assetBuyShare != null ? InputMode.SHARES : InputMode.AMOUNT;
    skipNextPriceFetch.current = true; // don't overwrite the existing price on initial open
    setForm({
      date: tx.buyDate,
      assetId: tx.assetId ?? "",
      currencyId: tx.buyCurrencyId,
      inputMode: mode,
      amount: tx.assetBuyAmount != null ? String(tx.assetBuyAmount) : "",
      shares: tx.assetBuyShare != null ? String(tx.assetBuyShare) : "",
      pricePerShare: tx.assetBuyPricePerShare != null ? String(tx.assetBuyPricePerShare) : "",
    });
    setFetchedPrice(null);
    setAutoFilled(false);
  }, [props.editTransaction]);

  // Reset form to empty when opening in add mode
  useEffect(() => {
    const dialog = props.dialogRef.current;
    if (!dialog) return;
    const handleShow = () => {
      if (!props.editTransaction) {
        const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
        setForm({ ...emptyBuy(), currencyId: eur });
        setSelectedAsset(null);
        setFetchedPrice(null);
        setAutoFilled(false);
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

  useEffect(() => {
    if (!form.assetId || !form.date) { setFetchedPrice(null); return; }
    // Skip only the first fetch triggered by the pre-fill; allow all subsequent (user changes)
    if (skipNextPriceFetch.current) { skipNextPriceFetch.current = false; return; }
    let cancelled = false;
    setPriceLoading(true);
    setAutoFilled(false);
    assetService.getAssetPrice(form.assetId, form.date)
      .then((r: AssetPriceResponse | null) => { if (!cancelled) setFetchedPrice(r?.price ?? null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date]);

  useEffect(() => {
    if (fetchedPrice == null || !form.currencyId) return;
    const sel = selectedAsset;
    const baseCcy = props.currencies.find((c) => c.uuid === sel?.baseCurrencyId)?.currencyName;
    const tgtCcy  = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName;
    // Always fill price per share (both modes) — Yahoo returns market price, not total amount
    const apply = (price: number) => {
      setForm((f) => ({ ...f, pricePerShare: String(parseFloat(price.toFixed(4))) }));
      setAutoFilled(true);
    };
    if (!baseCcy || !tgtCcy || baseCcy === tgtCcy) { apply(fetchedPrice); return; }
    let cancelled = false;
    setPriceLoading(true);
    currencyService.convertPrice(baseCcy, tgtCcy, fetchedPrice)
      .then((v) => { if (!cancelled) apply(v); })
      .catch(() => { if (!cancelled) apply(fetchedPrice); })
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [fetchedPrice, form.currencyId, form.assetId]);

  const handleSave = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId) return;
    const isAmtMode = form.inputMode === InputMode.AMOUNT;
    const pricePerShare = form.pricePerShare ? parseFloat(form.pricePerShare) : undefined;
    // Always derive all three values regardless of input mode
    const shares = isAmtMode
      ? (form.amount && pricePerShare ? parseFloat((parseFloat(form.amount) / pricePerShare).toFixed(6)) : undefined)
      : (form.shares ? parseFloat(form.shares) : undefined);
    const amount = isAmtMode
      ? (form.amount ? parseFloat(form.amount) : undefined)
      : (shares && pricePerShare ? parseFloat((shares * pricePerShare).toFixed(2)) : undefined);
    setSaving(true);
    try {
      let result: AssetBuyResponse;
      if (isEditMode && props.editTransaction) {
        result = await portfolioService.updateAssetBuy(props.portfolioId, props.editTransaction.id, {
          buyCurrencyId:         form.currencyId,
          buyDate:               form.date,
          assetBuyAmount:        amount,
          assetBuyShare:         shares,
          assetBuyPricePerShare: pricePerShare,
        });
        toast.success("Buy updated.");
      } else {
        result = await portfolioService.addAssetBuy({
          portfolioId:           props.portfolioId,
          assetId:               form.assetId || undefined,
          buyCurrencyId:         form.currencyId,
          buyDate:               form.date,
          assetBuyAmount:        amount,
          assetBuyShare:         shares,
          assetBuyPricePerShare: pricePerShare,
        });
        toast.success("Buy added.");
      }
      props.onSuccess(result);
      props.dialogRef.current?.close();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_SHARES_FOR_EXISTING_SELLS")
        toast.error("Reducing this buy would leave existing sells without enough shares.");
      else
        toast.error(isEditMode ? "Failed to update buy." : "Failed to add buy.");
    } finally {
      setSaving(false);
    }
  };

  const isAmountMode = form.inputMode === InputMode.AMOUNT;
  const currencyName = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";
  const computedTotal: number | null = (() => {
    const s = parseFloat(form.shares), p = parseFloat(form.pricePerShare);
    return !isAmountMode && s > 0 && p > 0 ? parseFloat((s * p).toFixed(2)) : null;
  })();
  const computedShares: number | null = (() => {
    const a = parseFloat(form.amount), p = parseFloat(form.pricePerShare);
    return isAmountMode && a > 0 && p > 0 ? parseFloat((a / p).toFixed(6)) : null;
  })();

  const sharesIsZero = !isAmountMode && form.shares !== "" && parseFloat(form.shares) <= 0;
  const amountIsZero = isAmountMode && form.amount !== "" && parseFloat(form.amount) <= 0;
  const buyPriceIsZero = form.pricePerShare !== "" && parseFloat(form.pricePerShare) <= 0;

  const isDisabled = saving || !form.date || !form.currencyId
    || (isAmountMode
      ? (!form.amount || !form.pricePerShare || amountIsZero || buyPriceIsZero)
      : (!form.shares || !form.pricePerShare || sharesIsZero || buyPriceIsZero));

  return (
    <>
      <dialog ref={props.dialogRef} className="modal">
        <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${tabAccent.BUYS.icon} flex items-center justify-center`}>
                <HiOutlineArrowTrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">{isEditMode ? "Edit buy" : "New buy"}</h3>
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

            {!isEditMode && (
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
                  onAddCustomAsset={() => customAssetDialogRef.current?.showModal()}
                />
              </div>
            )}

            {isEditMode && props.editTransaction?.companyName && (
              <div className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium">
                {props.editTransaction.companyName}
              </div>
            )}

            <div>
              <label className={`${labelCls} mb-1.5`}>Enter by</label>
              <InputModeToggle value={form.inputMode} onChange={(v) => setForm((f) => ({ ...f, inputMode: v }))} />
            </div>

            {isAmountMode ? (
              <>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>Total amount</label>
                    <input type="number" min={0} value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00" className={`${inputCls} ${amountIsZero ? "border-red-400 focus:ring-red-300" : ""}`} />
                    {amountIsZero && <p className="text-[11px] text-red-500 mt-1">Amount must be greater than 0</p>}
                  </div>
                  <div className="w-32">
                    <label className={labelCls}>Currency</label>
                    <select value={form.currencyId} onChange={(e) => setForm((f) => ({ ...f, currencyId: e.target.value }))} className={inputCls}>
                      <option value="">Currency</option>
                      {props.currencies.map((c) => <option key={c.uuid} value={c.uuid}>{c.currencyName}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}>Price per share</label>
                    {priceLoading && <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="loading loading-spinner loading-xs" /> Fetching…</span>}
                    {!priceLoading && autoFilled && <span className="text-[11px] text-purple-500 font-medium">Auto-filled</span>}
                  </div>
                  <input type="number" min={0} value={form.pricePerShare}
                    onChange={(e) => { setAutoFilled(false); setForm((f) => ({ ...f, pricePerShare: e.target.value })); }}
                    placeholder="0.00" className={`${inputCls} ${buyPriceIsZero ? "border-red-400 focus:ring-red-300" : ""}`} />
                  {buyPriceIsZero && <p className="text-[11px] text-red-500 mt-1">Price must be greater than 0</p>}
                </div>
                {computedShares != null && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-sm">
                    <span className="text-gray-500">Shares</span>
                    <span className="font-medium text-gray-900">{computedShares}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>Number of shares</label>
                  <input type="number" min={0} value={form.shares}
                    onChange={(e) => setForm((f) => ({ ...f, shares: e.target.value }))}
                    placeholder="0" className={`${inputCls} ${sharesIsZero ? "border-red-400 focus:ring-red-300" : ""}`} />
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
                      placeholder="0.00" className={`${inputCls} ${buyPriceIsZero ? "border-red-400 focus:ring-red-300" : ""}`} />
                    {buyPriceIsZero && <p className="text-[11px] text-red-500 mt-1">Price must be greater than 0</p>}
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
              </>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={() => props.dialogRef.current?.close()} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isDisabled}
                className={`flex-1 py-2.5 text-sm text-white ${tabAccent.BUYS.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}>
                {saving ? <span className="loading loading-spinner loading-xs text-white" /> : isEditMode ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      <AddCustomAssetModal
        dialogRef={customAssetDialogRef}
        onAssetCreated={(newAsset) => {
          setSelectedAsset(newAsset);
          setForm((f) => ({ ...f, assetId: newAsset.id }));
        }}
      />
    </>
  );
};

export default AddNewBuyModal;
