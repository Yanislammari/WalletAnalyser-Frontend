import type React from "react";
import type { Portfolio } from "../models/Portfolio";
import { useNavigate, type NavigateFunction } from "react-router";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { getPortfolioColor } from "../utils/Colors";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

const PortfolioCard: React.FC<PortfolioCardProps> = (props: PortfolioCardProps) => {
  const navigate: NavigateFunction = useNavigate();
  const colorClass: string = getPortfolioColor(props.portfolio.id);

  return (
    <div
      onClick={() => navigate(`/home/portfolio/${props.portfolio.id}/transactions`)}
      className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer min-h-[200px]"
    >
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
        <span className="text-[11px] text-gray-400 font-medium">0 assets</span>
        <span className="text-[11px] text-purple-600 font-medium group-hover:underline">
          Open →
        </span>
      </div>
    </div>
  );
}

export default PortfolioCard;
