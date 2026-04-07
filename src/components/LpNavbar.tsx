import type React from "react";
import { useNavigate, type NavigateFunction } from "react-router";

const LpNavbar: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
      <div className="text-xl font-bold tracking-tight text-gray-900">
        Wallet<span className="text-purple-600">Analyser</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
        <a href="#metrics" className="hover:text-gray-900 transition-colors">Metrics</a>
        <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
        <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors hover:cursor-pointer">
          Sign in
        </button>
        <button onClick={() => navigate("/main")} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors font-medium hover:cursor-pointer">
          Get started
        </button>
      </div>
    </nav>
  );
}

export default LpNavbar;
