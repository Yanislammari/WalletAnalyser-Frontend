import React, { useState, useRef } from "react";
import { HiOutlineXMark, HiOutlineCheckCircle, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { toast } from "sonner";
import type { Asset } from "../models/Asset";
import AssetService from "../services/AssetService";
import { inputCls, labelCls } from "../constants/transactionConstants";

interface AssetPreview {
  ticker: string;
  officialName: string | null;
  currency: string | null;
  price: number | null;
  assetType: string | null;
}

interface AddCustomAssetModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onAssetCreated: (asset: Asset) => void;
}

const AddCustomAssetModal: React.FC<AddCustomAssetModalProps> = ({ dialogRef, onAssetCreated }) => {
  const [ticker, setTicker] = useState<string>("");
  const [preview, setPreview] = useState<AssetPreview | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [previewing, setPreviewing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const assetService: AssetService = AssetService.getInstance();
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTicker("");
    setPreview(null);
    setNotFound(false);
    setPreviewing(false);
    setSaving(false);
  };

  const handleDialogClose = () => {
    reset();
    dialogRef.current?.close();
  };

  const handlePreview = async () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;

    setNotFound(false);
    setPreview(null);
    setPreviewing(true);

    try {
      const info = await assetService.previewCustomAsset(t);
      if (!info) {
        setNotFound(true);
      } else {
        setPreview(info);
      }
    }
    catch {
      setNotFound(true);
    }
    finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const asset: Asset = await assetService.createCustomAsset(preview.ticker);
      toast.success(`${preview.ticker} added to your assets.`);
      onAssetCreated(asset);
      handleDialogClose();
    }
    catch {
      toast.error("Failed to save asset.");
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <HiOutlineMagnifyingGlass className="w-5 h-5" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">Add custom asset</h3>
          </div>
          <button onClick={handleDialogClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Ticker symbol</label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value.toUpperCase());
                  setPreview(null);
                  setNotFound(false);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePreview(); }}
                placeholder="e.g. AAPL, LVMH.PA"
                className={`${inputCls} flex-1 uppercase`}
              />
              <button
                onClick={handlePreview}
                disabled={!ticker.trim() || previewing}
                className="px-3 py-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Check ticker"
              >
                {previewing
                  ? <span className="loading loading-spinner loading-xs" />
                  : <HiOutlineCheckCircle className="w-5 h-5" />
                }
              </button>
            </div>
          </div>

          {notFound && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              This ticker was not found on Yahoo Finance. Please check the symbol and try again.
            </div>
          )}

          {preview && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Ticker</span>
                <span className="text-sm font-semibold text-gray-900">{preview.ticker}</span>
              </div>
              {preview.officialName && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Name</span>
                  <span className="text-sm text-gray-700 text-right max-w-[180px] truncate">{preview.officialName}</span>
                </div>
              )}
              {preview.currency && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Currency</span>
                  <span className="text-sm text-gray-700">{preview.currency}</span>
                </div>
              )}
              {preview.price != null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Current price</span>
                  <span className="text-sm text-gray-700">{preview.price} {preview.currency ?? ""}</span>
                </div>
              )}
              {preview.assetType && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Type</span>
                  <span className="text-sm text-gray-700">{preview.assetType}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDialogClose}
              className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!preview || saving}
              className="flex-1 py-2.5 text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer"
            >
              {saving ? <span className="loading loading-spinner loading-xs text-white" /> : "Add asset"}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={reset}>close</button>
      </form>
    </dialog>
  );
};

export default AddCustomAssetModal;
