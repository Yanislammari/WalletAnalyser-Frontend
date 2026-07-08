import React from "react";
import { useNavigate } from "react-router";

/** Rendered inside the authenticated HomeLayout (sidebar + navbar already present). */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5 text-center">
      {/* Big muted number */}
      <p className="text-[96px] font-black text-gray-200 leading-none select-none">404</p>

      <div className="flex flex-col items-center gap-1 -mt-4">
        <h1 className="text-lg font-bold text-gray-900">Page not found</h1>
        <p className="text-sm text-gray-400 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Go back
        </button>
        <button
          onClick={() => navigate("/home/dashboard")}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
