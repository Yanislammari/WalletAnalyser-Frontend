import React from "react";
import { useNavigate, useParams } from "react-router";

const PortfolioNotFound: React.FC = () => {
  const navigate = useNavigate();
  const { portfolioId } = useParams<{ portfolioId: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center">

      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <svg className="w-9 h-9 text-rose-400" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M12 10v6" />
          </svg>
        </div>
        {/* Badge */}
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-gray-900">Portfolio not found</h1>
        <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
          This portfolio doesn't exist or you no longer have access to it.
        </p>
        {portfolioId && (
          <p className="text-[11px] font-mono text-gray-300 mt-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 max-w-xs mx-auto break-all">
            {portfolioId}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/home/dashboard")}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/home/portfolio")}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          My portfolios
        </button>
      </div>

    </div>
  );
};

export default PortfolioNotFound;
