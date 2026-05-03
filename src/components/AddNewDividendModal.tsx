import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { HiOutlineBanknotes, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import PortfolioService from "../services/PortfolioService";
import DateInput from "./DateInput";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import { emptyDividend, type DividendForm } from "../forms/DividendForm";

interface AddNewDividendModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (dividend: AssetDividendResponse) => void;
}

const AddNewDividendModal: React.FC<AddNewDividendModalProps> = (props: AddNewDividendModalProps) => {
  const [form, setForm] = useState<DividendForm>(emptyDividend());
  const [saving, setSaving] = useState<boolean>(false);
  const portfolioService = PortfolioService.getInstance();

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
      setForm({ ...emptyDividend(), currencyId: eur });
    };

    dialog.addEventListener("show", handleShow);
    return () => dialog.removeEventListener("show", handleShow);
  }, [props.dialogRef, props.currencies]);

  const handleAdd = async () => {
    if (!form.date || !form.amount || !form.currencyId || !props.portfolioId) {
      return;
    }

    setSaving(true);
    try {
      const portfolioId: string = props.portfolioId;
      const createdDividend: AssetDividendResponse = await portfolioService.addAssetDividend({
        portfolioId,
        currencyId: form.currencyId,
        cashflowDate: form.date,
        cashflowAmount: parseFloat(form.amount),
      });

      props.onSuccess(createdDividend);
      props.dialogRef.current?.close();
      toast.success("Dividend added.");
    }
    catch {
      toast.error("Failed to add entry.");
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${tabAccent.DIVIDENDS.icon} flex items-center justify-center`}>
              <HiOutlineBanknotes className="w-5 h-5" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">New dividend</h3>
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
            <DateInput value={form.date} onChange={(value) => setForm((form) => ({ ...form, date: value }))} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Amount</label>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setForm((form) => ({ ...form, amount: e.target.value }))}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div className="w-32">
              <label className={labelCls}>Currency</label>
              <select
                value={form.currencyId}
                onChange={(e) => setForm((form) => ({ ...form, currencyId: e.target.value }))}
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
              disabled={!form.date || !form.amount || !form.currencyId || saving}
              className={`flex-1 py-2.5 text-sm text-white ${tabAccent.DIVIDENDS.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}
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
}

export default AddNewDividendModal;
