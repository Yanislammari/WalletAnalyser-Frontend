import { HiOutlineBriefcase } from "react-icons/hi2"
import { useNavigate } from "react-router-dom";

const NoPortfolioSelected = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
        <HiOutlineBriefcase className="text-purple-400" size={28} />
      </div>
      <div className="text-center">
        <p className="text-gray-800 font-semibold text-base">No portfolio yet</p>
        <p className="text-gray-400 text-sm mt-1">Create your first portfolio to start tracking your investments.</p>
      </div>
      <button
        onClick={() => navigate("/home/portfolio", { state: { openCreateModal: true } })}
        className="mt-1 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
      >
        Create a portfolio
      </button>
    </div>
  )
}

export default NoPortfolioSelected