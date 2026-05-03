import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { HiOutlineArrowTrendingDown, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import InputModeToggle from "./InputModeToggle";
import PortfolioService from "../services/PortfolioService";
import { emptySell, type SellForm } from "../forms/SellForm";
import { InputMode } from "../enums/InputMode";

interface AddNewSellModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (sell: AssetSellResponse) => void;
}

const AddNewSellModal: React.FC<AddNewSellModalProps> = (props: AddNewSellModalProps) => {
  const [form, setForm] = useState<SellForm>(emptySell());
  const [saving, setSaving] = useState<boolean>(false);
  const portfolioService = PortfolioService.getInstance();

  useEffect(() => {
    if (props.currencies.length === 0) {
      return;
    }

    const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
    setForm((form) => ({
      ...form,
      currencyId: form.currencyId || eur,
      gainCurrencyId: form.gainCurrencyId || eur,
    }));
  }, [props.currencies]);

  useEffect(() => {
    const dialog: HTMLDialogElement | null = props.dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleShow = () => {
      const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
      setForm({ ...emptySell(), currencyId: eur, gainCurrencyId: eur });
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
      const portfolioId: string = props.portfolioId;
      const createdSell: AssetSellResponse = await portfolioService.addAssetSell({
        portfolioId,
        companyName: form.company || undefined,
        sellCurrencyId: form.currencyId,
        sellDate: form.date,
        assetSellAmount: form.amount ? parseFloat(form.amount) : undefined,
        assetSellShare: form.shares ? parseFloat(form.shares) : undefined,
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
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((form) => ({ ...form, date: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Company</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm((form) => ({ ...form, company: e.target.value }))}
              placeholder="e.g. Apple Inc."
              className={inputCls}
            />
          </div>
          <div>
            <label className={`${labelCls} mb-1.5`}>Enter by</label>
            <InputModeToggle value={form.inputMode} onChange={(value) => setForm((form) => ({ ...form, inputMode: value }))} />
          </div>
          {form.inputMode === InputMode.AMOUNT ? (
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
          ) : (
            <div>
              <label className={labelCls}>Number of shares</label>
              <input
                type="number"
                min={0}
                value={form.shares}
                onChange={(e) => setForm((form) => ({ ...form, shares: e.target.value }))}
                placeholder="0"
                className={inputCls}
              />
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Capital gain</label>
              <input
                type="number"
                value={form.capitalGain}
                onChange={(e) => setForm((form) => ({ ...form, capitalGain: e.target.value }))}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div className="w-32">
              <label className={labelCls}>Currency</label>
              <select
                value={form.gainCurrencyId}
                onChange={(e) => setForm((form) => ({ ...form, gainCurrencyId: e.target.value }))}
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
              disabled={!form.date || !form.currencyId || saving}
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
}

export default AddNewSellModal;
