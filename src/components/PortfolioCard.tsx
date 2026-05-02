import type React from "react";
import type { Portfolio } from "../models/Portfolio";
import { useNavigate, type NavigateFunction } from "react-router";
import { HiOutlineBriefcase } from "react-icons/hi2";

const PORTFOLIO_COLORS: string[] = [
  "from-purple-500 to-indigo-600",
  "from-indigo-500 to-blue-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

interface PortfolioCardProps {
  portfolio: Portfolio;
}

const getColorClass = (portfolioId: string | number): string => {
  const numericId: number = Number.parseInt(String(portfolioId), 10);
  const safeId: number = Number.isNaN(numericId) ? 0 : numericId;
  return PORTFOLIO_COLORS[safeId % PORTFOLIO_COLORS.length];
};

const PortfolioCard: React.FC<PortfolioCardProps> = (props: PortfolioCardProps) => {
  const navigate: NavigateFunction = useNavigate();
  const colorClass: string = getColorClass(props.portfolio.id);

  return (
    <div
      onClick={() => navigate(`/home/portfolio/${props.portfolio.id}/transactions`)}
      className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
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
          Open
        </span>
      </div>
    </div>
  );
}

export default PortfolioCard;
