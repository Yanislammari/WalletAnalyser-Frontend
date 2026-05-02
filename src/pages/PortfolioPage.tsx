import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { HiOutlineBriefcase, HiOutlinePlus } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";
import Loading from "../components/Loading";
import PortfolioCard from "../components/PortfolioCard";
import NewPortfolioCard from "../components/NewPortfolioCard";
import CreatePortfolioModal from "../components/CreatePortfolioModal";

const PortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const portfolioService = PortfolioService.getInstance();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchPortfolios = async () => {
      try {
        const portfolios: Portfolio[] = await portfolioService.getPortfoliosByUserId(user.id);
        setPortfolios(portfolios);
      }
      catch {
        toast.error("Failed to load portfolios.");
      }
      finally {
        setLoading(false);
      }
    };
    
    fetchPortfolios();
  }, [user]);

  const openModal = () => {
    setNewName("");
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    if (!loading && location.state?.openCreateModal) {
      openModal();
      window.history.replaceState({}, "");
    }
  }, [loading, location.state]);

  const closeModal = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog: HTMLDialogElement | null = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => setNewName("");
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user) {
      return;
    }

    setCreating(true);
    try {
      const createdPortfolio: Portfolio = await portfolioService.createPortfolio({ userId: user.id, name: newName.trim() });
      setPortfolios((prev) => [...prev, createdPortfolio]);
      closeModal();
      toast.success(`Portfolio "${createdPortfolio.name}" created!`);
    }
    catch {
      toast.error("Failed to create portfolio.");
    }
    finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-xl font-bold tracking-tight">My Portfolios</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage and track all your investment portfolios.</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer font-medium shadow-sm shadow-purple-200 shrink-0"
        >
          <HiOutlinePlus size={16} />
          New portfolio
        </button>
      </div>
      {loading ? (
        <Loading size={96} />
      ) : portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-20 h-20 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <HiOutlineBriefcase className="w-9 h-9 text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-base">No portfolios yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first portfolio to start tracking your investments.</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer font-medium shadow-sm shadow-purple-200"
          >
            <HiOutlinePlus size={16} />
            Create a portfolio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
          <NewPortfolioCard onClick={openModal} />
        </div>
      )}
      <CreatePortfolioModal 
        dialogRef={dialogRef} 
        newName={newName} 
        onNameChange={setNewName} 
        creating={creating} 
        onCreate={handleCreate} 
        onClose={closeModal}
      />
    </div>
  );
}

export default PortfolioPage;
