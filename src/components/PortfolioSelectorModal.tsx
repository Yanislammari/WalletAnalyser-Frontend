import type React from "react";
import { HiOutlinePencilSquare, HiOutlineBriefcase, HiOutlineXMark } from "react-icons/hi2";
import type { Portfolio } from "../models/Portfolio";
import Loading from "./Loading";
import PortfolioSelectorItem from "./PortfolioSelectorItem";

interface PortfolioSelectorModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  portfolios: Portfolio[];
  loadingPortfolios: boolean;
  onClose: () => void;
  onSelectPortfolio: (portfolioId: string) => void;
  onGoToCreatePortfolio: () => void;
}

const PortfolioSelectorModal: React.FC<PortfolioSelectorModalProps> = (props: PortfolioSelectorModalProps) => {
  return (
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <HiOutlinePencilSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">Select a portfolio</h3>
          </div>
          <button
            onClick={props.onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>
        {props.loadingPortfolios ? (
          <Loading size={96} />
        ) : props.portfolios.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <HiOutlineBriefcase className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-500">No portfolio found.</p>
            <button
              onClick={props.onGoToCreatePortfolio}
              type="button"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
            >
              Create a portfolio →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {props.portfolios.map((portfolio) => (
              <PortfolioSelectorItem key={portfolio.id} portfolio={portfolio} onClick={() => props.onSelectPortfolio(portfolio.id)} />
            ))}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default PortfolioSelectorModal;
