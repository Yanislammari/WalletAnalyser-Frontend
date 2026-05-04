import type React from "react";
import { HiOutlinePlus } from "react-icons/hi2";

interface NewPortfolioCardProps {
  onClick: () => void;
}

const NewPortfolioCard: React.FC<NewPortfolioCardProps> = (props: NewPortfolioCardProps) => {
  return (
    <button
      onClick={props.onClick}
      className="border-2 border-dashed border-purple-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group min-h-[200px]"
    >
      <div className="w-12 h-12 rounded-2xl bg-purple-100 group-hover:bg-purple-200 transition-colors flex items-center justify-center">
        <HiOutlinePlus className="w-6 h-6 text-purple-500" />
      </div>
      <p className="text-sm font-medium text-purple-600">New portfolio</p>
    </button>
  );
}

export default NewPortfolioCard;
