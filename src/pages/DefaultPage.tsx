import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { Link } from "react-router-dom";

export const ConnectedNotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f4fb] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden">
        <div className="px-8 pt-10 pb-7 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 shadow-sm">
            <HiOutlineExclamationTriangle className="text-orange-400" size={32} />
          </div>
          <h1 className="text-gray-900 font-bold text-xl tracking-tight">Page not found</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <p className="text-gray-400 text-xs mt-3 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 w-full text-left">
            Check the URL for typos, or head back to a page that exists.
          </p>
        </div>
        <div className="px-8 pb-8">
          <Link
            to="/home/dashboard"
            className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-purple-200 cursor-pointer"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export const UnauthenticatedNotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f4fb] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden">
        <div className="px-8 pt-10 pb-7 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 shadow-sm">
            <HiOutlineExclamationTriangle className="text-orange-400" size={32} />
          </div>
          <h1 className="text-gray-900 font-bold text-xl tracking-tight">Page not found</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <p className="text-gray-400 text-xs mt-3 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 w-full text-left">
            If you're already signed in, you'll be taken straight to your dashboard.
          </p>
        </div>
        <div className="px-8 pb-8">
          <Link
            to="/login"
            className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-purple-200 cursor-pointer"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
};

