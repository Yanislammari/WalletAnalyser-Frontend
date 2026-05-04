import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { HiOutlineArrowTrendingUp, HiOutlineXMark } from "react-icons/hi2";
import type { Currency } from "../models/Currency";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import { tabAccent, inputCls, labelCls } from "../constants/transactionConstants";
import InputModeToggle from "./InputModeToggle";
import DateInput from "./DateInput";
import PortfolioService from "../services/PortfolioService";
import { emptyBuy, type BuyForm } from "../forms/BuyForm";
import { InputMode } from "../enums/InputMode";

interface AddNewBuyModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (buy: AssetBuyResponse) => void;
}

const AddNewBuyModal: React.FC<AddNewBuyModalProps> = (props: AddNewBuyModalProps) => {
  const [form, setForm] = useState<BuyForm>(emptyBuy());
  const [saving, setSaving] = useState<boolean>(false);
  const portfolioService = PortfolioService.getInstance();

  useEffect(() => {
    if (props.currencies.length === 0){
      return;
    }

    const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
    setForm((form) => ({ ...form, currencyId: form.currencyId || eur }));
  }, [props.currencies]);

  useEffect(() => {
    const dialog: HTMLDialogElement | null = props.dialogRef.current;
    if (!dialog){
      return;
    }

    const handleShow = () => {
      const eur: string = props.currencies.find((currency) => currency.currencyName === "EUR")?.uuid ?? props.currencies[0]?.uuid ?? "";
      setForm({ ...emptyBuy(), currencyId: eur });
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
      const createdBuy: AssetBuyResponse = await portfolioService.addAssetBuy({
        portfolioId,
        companyName: form.company || undefined,
        buyCurrencyId: form.currencyId,
        buyDate: form.date,
        assetBuyAmount: form.amount ? parseFloat(form.amount) : undefined,
        assetBuyShare: form.shares ? parseFloat(form.shares) : undefined,
        assetBuyPricePerShare: form.pricePerShare ? parseFloat(form.pricePerShare) : undefined,
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

  return (
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
              onChange={(value) => setForm((form) => ({ ...form, date: value }))}
              portalTarget={props.dialogRef.current}
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
          <div>
            <label className={labelCls}>Price per share</label>
            <input
              type="number"
              min={0}
              value={form.pricePerShare}
              onChange={(e) => setForm((form) => ({ ...form, pricePerShare: e.target.value }))}
              placeholder="0.00"
              className={inputCls}
            />
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
              disabled={!form.date || !form.company || !form.currencyId || !form.pricePerShare || (form.inputMode === InputMode.AMOUNT ? !form.amount : !form.shares) || saving}
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
  );
}

export default AddNewBuyModal;
