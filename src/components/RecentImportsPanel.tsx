import React, { useEffect, useRef, useState } from "react";
import {
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineArrowUpTray,
} from "react-icons/hi2";
import ImportService, { type ImportHistoryItem, type ImportRowError } from "../services/ImportService";

interface RecentImportsPanelProps {
  portfolioId: string | null;
  refreshKey?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
  if (!iso) return "—";
  // Normalise any residual PostgreSQL format ("2026-07-08 12:30:00+00") just in case
  const normalized = iso.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
};

// ─── Detail modal ─────────────────────────────────────────────────────────────

interface ImportDetailModalProps {
  item: ImportHistoryItem | null;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
}

const ImportDetailModal: React.FC<ImportDetailModalProps> = ({ item, dialogRef, onClose }) => {
  // Always render the <dialog> element so dialogRef is always mounted and
  // showModal() can be called reliably on the very first click.
  const hasErrors  = item ? item.errorCount > 0 : false;
  const allSuccess = item ? item.errorCount === 0 && item.skippedCount === 0 : false;

  return (
    <dialog ref={dialogRef} className="modal">
      {item && <div className="modal-box bg-white rounded-2xl p-0 max-w-lg w-full shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <HiOutlineArrowUpTray size={15} className="text-indigo-500" />
            </div>
            <h3 className="text-gray-900 font-bold text-sm">Import details</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1"
          >
            <HiOutlineXMark size={18} />
          </button>
        </div>

        {/* File info */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <HiOutlineDocumentText size={20} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {item.filename ?? "Unnamed file"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="px-4 py-3 text-center">
            <p className="text-lg font-bold text-gray-900">{item.importedCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Imported</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className={`text-lg font-bold ${item.skippedCount > 0 ? "text-amber-500" : "text-gray-900"}`}>
              {item.skippedCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Skipped</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className={`text-lg font-bold ${item.errorCount > 0 ? "text-red-500" : "text-gray-900"}`}>
              {item.errorCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Errors</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-80 overflow-y-auto">
          {allSuccess && (
            <div className="flex items-center gap-2.5 py-2">
              <HiOutlineCheckCircle size={18} className="text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">All transactions imported successfully.</p>
            </div>
          )}

          {!allSuccess && !hasErrors && item.skippedCount > 0 && (
            <div className="flex items-start gap-2.5 py-2">
              <HiOutlineExclamationTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">
                {item.skippedCount} row{item.skippedCount !== 1 ? "s were" : " was"} skipped (e.g. insufficient shares to sell).
              </p>
            </div>
          )}

          {hasErrors && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
                Row errors
              </p>
              <div className="space-y-3">
                {item.errors.map((e: ImportRowError, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                    <HiOutlineExclamationCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700">
                        Row {e.row}
                        {e.ticker && e.ticker !== "?" && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-mono">
                            {e.ticker}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words">{e.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>}

      {/* Backdrop closes modal */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

const RecentImportsPanel: React.FC<RecentImportsPanelProps> = ({ portfolioId, refreshKey }) => {
  const [history, setHistory]       = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState<ImportHistoryItem | null>(null);
  const dialogRef                   = useRef<HTMLDialogElement>(null);

  // Open the dialog AFTER the re-render so dialogRef is always mounted
  useEffect(() => {
    if (selected) {
      dialogRef.current?.showModal();
    }
  }, [selected]);

  useEffect(() => {
    if (!portfolioId) {
      setHistory([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    ImportService.getInstance()
      .getImportHistory(portfolioId)
      .then((data) => { if (!cancelled) setHistory(data); })
      .catch(() => { if (!cancelled) setHistory([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [portfolioId, refreshKey]);

  const openModal = (item: ImportHistoryItem) => {
    setSelected(item); // useEffect above calls showModal() after re-render
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setSelected(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Title bar */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <HiOutlineClock size={15} className="text-indigo-500" />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Recent imports</p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-2/5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-1">
              <HiOutlineDocumentText size={20} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No imports yet</p>
            <p className="text-xs text-gray-300">
              {portfolioId
                ? "Upload a CSV file above to get started."
                : "Select a portfolio to see its import history."}
            </p>
          </div>
        )}

        {/* History list */}
        {!loading && history.length > 0 && (
          <div className="divide-y divide-gray-50">
            {history.map((item) => {
              const hasErrors   = item.errorCount > 0;
              const statusColor = hasErrors
                ? "text-amber-600 bg-amber-50"
                : "text-emerald-600 bg-emerald-50";
              const statusLabel = hasErrors
                ? `${item.errorCount} error${item.errorCount !== 1 ? "s" : ""}`
                : "Success";

              return (
                <button
                  key={item.id}
                  onClick={() => openModal(item)}
                  className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <HiOutlineDocumentText size={17} className="text-indigo-500" />
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.filename ?? "Unnamed file"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.importedCount} imported
                      {item.skippedCount > 0 && ` · ${item.skippedCount} skipped`}
                      <span className="hidden sm:inline"> · {formatDate(item.createdAt)}</span>
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                    {!hasErrors && (
                      <HiOutlineCheckCircle size={15} className="text-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <ImportDetailModal item={selected} dialogRef={dialogRef} onClose={closeModal} />
    </>
  );
};

export default RecentImportsPanel;
