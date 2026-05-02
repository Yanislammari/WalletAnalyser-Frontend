import type React from "react";
import type { Portfolio } from "../models/Portfolio";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { getPortfolioColor } from "../utils/Colors";

interface PortfolioSelectorItemProps {
  portfolio: Portfolio;
  onClick: () => void;
}

const PortfolioSelectorItem: React.FC<PortfolioSelectorItemProps> = (props: PortfolioSelectorItemProps) => {
  const colorClass: string = getPortfolioColor(props.portfolio.id);

  return (
    <button
      onClick={props.onClick}
      type="button"
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
    >
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0`}>
        <HiOutlineBriefcase className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {props.portfolio.name}
        </p>
        <p className="text-[11px] text-gray-400">
          {new Date(props.portfolio.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <span className="text-gray-300 text-sm">→</span>
    </button>
  );
}

export default PortfolioSelectorItem;
