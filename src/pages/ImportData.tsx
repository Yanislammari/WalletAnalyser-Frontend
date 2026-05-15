import React, { useState, useRef } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { HiOutlinePencilSquare, HiOutlineTableCells } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import ImportService from "../services/ImportService";
import type { Portfolio } from "../models/Portfolio";
import ImportDataDropzone from "../components/ImportDataDropzone";
import RecentImportsPanel from "../components/RecentImportsPanel";
import PortfolioSelectorModal from "../components/PortfolioSelectorModal";
import type { TemplateFormatUI } from "../models/UI/TemplateFormatUI";
import DownloadTemplateButton from "../components/DownloadTemplateButton";
import type { Format } from "../enums/Format";

const TEMPLATES_FORMATS: TemplateFormatUI[] = [
  {
    format: "XLSX",
    ext: ".xlsx",
    dl: "xlsx" as const,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    hover: "hover:bg-emerald-50/60"
  },
  {
    format: "XLS",
    ext: ".xls",
    dl: "xls" as const,
    color: "text-blue-600",
    bg: "bg-blue-50",
    hover: "hover:bg-blue-50/60"
  },
  {
    format: "CSV",
    ext: ".csv",
    dl: "csv" as const,
    color: "text-orange-500",
    bg: "bg-orange-50",
    hover: "hover:bg-orange-50/60"
  }
];

const ImportData: React.FC = () => {
  const { user } = useAuth();
  const navigate: NavigateFunction = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState<boolean>(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const openManualModal = async () => {
    if (!user) {
      return;
    }

    setLoadingPortfolios(true);
    dialogRef.current?.showModal();

    try {
      const portfolios: Portfolio[] = await PortfolioService.getInstance().getAllPortfoliosByUserId(user.id);
      setPortfolios(portfolios);
    }
    catch {
      setPortfolios([]);
    }
    finally {
      setLoadingPortfolios(false);
    }
  };

  const handleSelectPortfolio = (portfolioId: string) => {
    dialogRef.current?.close();
    navigate(`/home/portfolio/${portfolioId}/transactions`);
  };

  const handleDownloadTemplate = async (format: Format) => {
    if (downloadingFormat) {
      return;
    }

    setDownloadingFormat(format);
    try {
      await ImportService.getInstance().downloadTemplate(format);
    }
    catch {}
    finally {
      setDownloadingFormat(null);
    }
  };

  const onGoToCreatePortfolio = () => {
    dialogRef.current?.close();
    setPortfolios([]);
    navigate("/home/portfolio", { state: { openCreateModal: true } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-xl font-bold tracking-tight">Import Data</h2>
        <p className="text-gray-500 text-sm mt-0.5">Upload your portfolio file or enter transactions manually.</p>
      </div>
      <ImportDataDropzone />
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <HiOutlineTableCells size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Download example template</p>
            <p className="text-xs text-gray-400 mt-0.5">Format your transactions using one of these templates before importing.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {TEMPLATES_FORMATS.map((templateFormat) => {
            const isLoading: boolean = downloadingFormat === templateFormat.dl;
            return (
              <DownloadTemplateButton
                key={templateFormat.dl}
                templateFormat={templateFormat}
                isLoading={isLoading}
                downloadingFormat={downloadingFormat}
                handleDownloadTemplate={handleDownloadTemplate}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
      <button
        onClick={openManualModal}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 rounded-2xl text-sm font-medium text-gray-700 hover:text-purple-700 transition-all cursor-pointer shadow-sm"
      >
        <HiOutlinePencilSquare size={18} className="text-purple-500" />
        Enter manually
      </button>
      <RecentImportsPanel /> {/* TODO: Plug reals recent imports later */}
      <PortfolioSelectorModal
        dialogRef={dialogRef}
        portfolios={portfolios}
        loadingPortfolios={loadingPortfolios}
        onClose={() => dialogRef.current?.close()}
        onSelectPortfolio={handleSelectPortfolio}
        onGoToCreatePortfolio={onGoToCreatePortfolio}
      />
    </div>
  );
}

export default ImportData;
