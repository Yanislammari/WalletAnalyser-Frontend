import React, { useState, useRef, useCallback } from "react";
import {
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import ImportService, { type ImportResult } from "../services/ImportService";

interface ImportDataDropzoneProps {
  portfolioId: string | null;
  onImportComplete?: () => void;
}

type Stage = "idle" | "selected" | "loading" | "done";

const ImportDataDropzone: React.FC<ImportDataDropzoneProps> = ({ portfolioId, onImportComplete }) => {
  const [stage, setStage]       = useState<Stage>("idle");
  const [file, setFile]         = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult]     = useState<ImportResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // ─── File handling ──────────────────────────────────────────────────────────

  const acceptFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are accepted");
      return;
    }
    setError(null);
    setFile(f);
    setResult(null);
    setStage("selected");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()                     => setDragging(false);

  const reset = () => {
    setStage("idle");
    setFile(null);
    setResult(null);
    setError(null);
  };

  // ─── Import ─────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!file || !portfolioId) return;
    setStage("loading");
    setError(null);
    try {
      const res = await ImportService.getInstance().importCsv(portfolioId, file);
      setResult(res);
      setStage("done");
      onImportComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStage("selected"); // let them retry
    }
  };

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const dropzoneBase =
    "border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group";

  if (!portfolioId) {
    return (
      <div className={`${dropzoneBase} border-gray-200 bg-gray-50`}>
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <HiOutlineArrowUpTray className="w-7 h-7 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-gray-500 font-semibold text-sm">No portfolio selected</p>
          <p className="text-gray-400 text-xs mt-1">Select a portfolio from the top navigation before importing.</p>
        </div>
      </div>
    );
  }

  // ── Done stage ───────────────────────────────────────────────────────────────
  if (stage === "done" && result) {
    const hasErrors = result.errors.length > 0;
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center gap-3 ${hasErrors ? "bg-amber-50" : "bg-emerald-50"}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${hasErrors ? "bg-amber-100" : "bg-emerald-100"}`}>
            {hasErrors
              ? <HiOutlineExclamationTriangle className="text-amber-600" size={18} />
              : <HiOutlineCheckCircle className="text-emerald-600" size={18} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${hasErrors ? "text-amber-700" : "text-emerald-700"}`}>
              Import complete
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {result.imported} transaction{result.imported !== 1 ? "s" : ""} imported
              {result.skipped > 0 && ` · ${result.skipped} skipped`}
              {result.errors.length > 0 && ` · ${result.errors.length} error${result.errors.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Import another
          </button>
        </div>

        {/* Error table — scrollable so errors never disappear off-screen */}
        {hasErrors && (
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {result.errors.map((e, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <HiOutlineExclamationCircle className="text-red-400 mt-0.5 shrink-0" size={15} />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-gray-700">Row {e.row} · {e.ticker}</span>
                  <p className="text-xs text-gray-400 mt-0.5 break-words">{e.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Loading stage ────────────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className={`${dropzoneBase} border-purple-200 bg-purple-50/30`}>
        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center animate-pulse">
          <HiOutlineArrowUpTray className="w-7 h-7 text-purple-500" />
        </div>
        <div className="text-center">
          <p className="text-purple-700 font-semibold text-sm">Importing…</p>
          <p className="text-gray-400 text-xs mt-1">Resolving tickers and creating transactions. This may take a moment.</p>
        </div>
      </div>
    );
  }

  // ── Selected stage ───────────────────────────────────────────────────────────
  if (stage === "selected" && file) {
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-50">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <HiOutlineDocumentText className="text-orange-500" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · CSV</p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <HiOutlineXMark size={16} />
          </button>
        </div>
        {error && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
            <HiOutlineExclamationCircle className="text-red-500 shrink-0" size={15} />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Dividends will be automatically synced after import.
          </p>
          <button
            onClick={handleImport}
            className="shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Import
          </button>
        </div>
      </div>
    );
  }

  // ── Idle stage (default) ─────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`${dropzoneBase} ${
          dragging
            ? "border-purple-400 bg-purple-50"
            : "border-purple-200 hover:border-purple-400 hover:bg-purple-50/30"
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-purple-200" : "bg-purple-100 group-hover:bg-purple-200"}`}>
          <HiOutlineArrowUpTray className="w-7 h-7 text-purple-600" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Drop your CSV here or <span className="text-purple-600">browse</span>
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Required: <span className="font-mono text-gray-500">ticker, type, date</span>
            {" · "}Optional: <span className="font-mono text-gray-500">shares, amount, currency</span>
          </p>
        </div>
        <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-600 text-[11px] rounded-full font-medium">
          .csv — up to 10 MB
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
          <HiOutlineExclamationCircle className="text-red-400 shrink-0" size={15} />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImportDataDropzone;
