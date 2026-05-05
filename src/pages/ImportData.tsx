import React, { useState, useRef } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";
import ImportDataDropzone from "../components/ImportDataDropzone";
import RecentImportsPanel from "../components/RecentImportsPanel";
import PortfolioSelectorModal from "../components/PortfolioSelectorModal";

const ImportData: React.FC = () => {
  const { user } = useAuth();
  const navigate: NavigateFunction = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState<boolean>(false);

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
