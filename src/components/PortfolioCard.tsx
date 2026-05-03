import React, { useEffect, useRef, useState } from "react";
import type { Portfolio } from "../models/Portfolio";
import { useNavigate, type NavigateFunction } from "react-router";
import { HiOutlineBriefcase, HiOutlineTrash } from "react-icons/hi2";
import { getPortfolioColor } from "../utils/Colors";
import PortfolioService from "../services/PortfolioService";
import DeletePortfolioModal from "./DeletePortfolioModal";
import { toast } from "sonner";

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (portfolioId: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = (props: PortfolioCardProps) => {
  const navigate: NavigateFunction = useNavigate();
  const colorClass: string = getPortfolioColor(props.portfolio.id);
  const portfolioService = PortfolioService.getInstance();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [assetCount, setAssetCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchAssetCount = async () => {
      try {
        const { total } = await portfolioService.getAssetCountByPortfolioId(props.portfolio.id);
        setAssetCount(total);
      }
      catch {
        setAssetCount(0);
      }
    };

    fetchAssetCount();
  }, [props.portfolio.id]);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingCount(true);

    try {
      const { total } = await portfolioService.getAssetCountByPortfolioId(props.portfolio.id);
      setAssetCount(total);
    }
    catch {
      toast.error("Failed to fetch asset count.");
      return;
    }
    finally {
      setLoadingCount(false);
    }

    dialogRef.current?.showModal();
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await portfolioService.deletePortfolio(props.portfolio.id);
      dialogRef.current?.close();
      toast.success(`Portfolio "${props.portfolio.name}" deleted.`);
      props.onDelete(props.portfolio.id);
    }
    catch {
      toast.error("Failed to delete portfolio.");
    }
    finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    dialogRef.current?.close();
  };

  return (
    <div>
      <div
        onClick={() => navigate(`/home/portfolio/${props.portfolio.id}/transactions`)}
        className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer min-h-[200px]"
      >
        <button
          onClick={handleDeleteClick}
          disabled={loadingCount}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
          title="Delete portfolio"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg mb-4`}>
          <HiOutlineBriefcase className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-900 font-semibold text-base truncate">
          {props.portfolio.name}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Created{" "}
          {new Date(props.portfolio.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-medium">
            {assetCount === null ? "— assets" : `${assetCount} ${assetCount === 1 ? "asset" : "assets"}`}
          </span>
          <span className="text-[11px] text-purple-600 font-medium group-hover:underline">
            Open →
          </span>
        </div>
      </div>
      <DeletePortfolioModal
        dialogRef={dialogRef}
        portfolioName={props.portfolio.name}
        assetCount={assetCount}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
        onClose={handleClose}
      />
    </div>
  );
}

export default PortfolioCard;
