import React, { useState, useEffect, useRef } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { toast } from "sonner";
import { HiOutlineBriefcase, HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";
import Loading from "../components/Loading";
import PortfolioCard from "../components/PortfolioCard";

const PortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate: NavigateFunction = useNavigate();
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
        /* Portfolio grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}

          {/* Add card */}
          <button
            onClick={openModal}
            className="border-2 border-dashed border-purple-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 group-hover:bg-purple-200 transition-colors flex items-center justify-center">
              <HiOutlinePlus className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-purple-600">New portfolio</p>
          </button>
        </div>
      )}

      {/* Create portfolio modal */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <HiOutlineBriefcase className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">New portfolio</h3>
            </div>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <HiOutlineXMark size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Portfolio name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Long-term growth"
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex-1 py-2.5 text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer"
              >
                {creating ? <span className="loading loading-spinner loading-xs text-white" /> : "Create"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default PortfolioPage;
