import React from "react";
import { useNavigate } from "react-router";

/** Standalone 404 — rendered outside any layout (no sidebar / navbar). */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f4fb] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[120px] font-black text-gray-200 leading-none select-none">404</p>

        <div className="flex flex-col items-center gap-1 -mt-4 mb-8">
          <h1 className="text-xl font-bold text-gray-900">Page not found</h1>
          <p className="text-sm text-gray-400 max-w-xs">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Go back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
