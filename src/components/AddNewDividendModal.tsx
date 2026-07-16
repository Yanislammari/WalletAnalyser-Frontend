import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { HiOutlineBanknotes, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import DateInput from "./DateInput";
import AssetSearchSelect from "./AssetSearchSelect";
import AddCustomAssetModal from "./AddCustomAssetModal";
import { emptyDividend, type DividendForm } from "../forms/DividendForm";
import { useAuth } from "../providers/AuthProvider";

interface AddNewDividendModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (dividend: AssetDividendResponse) => void;
  editTransaction?: AssetDividendResponse;
}

const AddNewDividendModal: React.FC<AddNewDividendModalProps> = (props) => {
  const isEditMode = !!props.editTransaction;
  const [form, setForm] = useState<DividendForm>(emptyDividend());
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const customAssetDialogRef = useRef<HTMLDialogElement>(null);
  const portfolioService = PortfolioService.getInstance();
  const assetService = AssetService.getInstance();
  const { isPro } = useAuth();
  const freeMinDate = !isPro
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined;

  // Reset selected asset when switching between add/edit
  useEffect(() => {
    if (!props.editTransaction) setSelectedAsset(null);
  }, [props.editTransaction]);

  useEffect(() => {
    if (props.currencies.length === 0) return;
    const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
    setForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
  }, [props.currencies]);

  // Pre-fill form immediately when editTransaction prop changes (avoids "show" event timing race)
  useEffect(() => {
    if (!props.editTransaction) return;
    const tx = props.editTransaction;
    setForm({
      date:       tx.cashflowDate,
      assetId:    "",
      amount:     String(tx.cashflowAmount),
      currencyId: tx.currencyId,
    });
  }, [props.editTransaction]);

  // Reset form to empty when opening in add mode
  useEffect(() => {
    const dialog = props.dialogRef.current;
    if (!dialog) return;
    const handleShow = () => {
      if (!props.editTransaction) {
        const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
        setForm({ ...emptyDividend(), currencyId: eur });
      }
    };
    dialog.addEventListener("show", handleShow);
    return () => dialog.removeEventListener("show", handleShow);
  }, [props.dialogRef, props.currencies, props.editTransaction]);

  const handleSave = async () => {
    if (!form.date || !form.amount || !form.currencyId || !props.portfolioId) return;
    setSaving(true);
    try {
      let result: AssetDividendResponse;
      if (isEditMode && props.editTransaction) {
        result = await portfolioService.updateAssetDividend(props.portfolioId, props.editTransaction.id, {
          currencyId:      form.currencyId,
          cashflowDate:    form.date,
          cashflowAmount:  parseFloat(form.amount),
        });
        toast.success("Dividend updated.");
      } else {
        result = await portfolioService.addAssetDividend({
          portfolioId:     props.portfolioId,
          assetId:         form.assetId || undefined,
          currencyId:      form.currencyId,
          cashflowDate:    form.date,
          cashflowAmount:  parseFloat(form.amount),
        });
        toast.success("Dividend added.");
      }
      props.onSuccess(result);
      props.dialogRef.current?.close();
    } catch {
      toast.error(isEditMode ? "Failed to update dividend." : "Failed to add dividend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <dialog ref={props.dialogRef} className="modal">
        <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${tabAccent.DIVIDENDS.icon} flex items-center justify-center`}>
                <HiOutlineBanknotes className="w-5 h-5" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">{isEditMode ? "Edit dividend" : "New dividend"}</h3>
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

            {isEditMode && props.editTransaction?.companyName && (
              <div className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium">
                {props.editTransaction.companyName}
              </div>
            )}

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
                  placeholder="Search for an asset... (optional)"
                  portalTarget={props.dialogRef.current}
                  onAddCustomAsset={() => customAssetDialogRef.current?.showModal()}
                />
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelCls}>Amount</label>
                <input type="number" min={0} value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" className={inputCls} />
              </div>
              <div className="w-32">
                <label className={labelCls}>Currency</label>
                <select value={form.currencyId} onChange={(e) => setForm((f) => ({ ...f, currencyId: e.target.value }))} className={inputCls}>
                  <option value="">Currency</option>
                  {props.currencies.map((c) => <option key={c.uuid} value={c.uuid}>{c.currencyName}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => props.dialogRef.current?.close()} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!form.date || !form.amount || !form.currencyId || saving}
                className={`flex-1 py-2.5 text-sm text-white ${tabAccent.DIVIDENDS.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}>
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

export default AddNewDividendModal;
