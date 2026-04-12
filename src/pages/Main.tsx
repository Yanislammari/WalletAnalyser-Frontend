import React from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import Background from "../components/Background";
import GoogleAuthButton from "../components/GoogleAuthButton";

const Main: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <Background>
      <div className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-3xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Wallet<span className="text-purple-600">Analyser</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Analyze, compare and optimize your investments
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/login")}
            className="btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/register")}
            className="btn btn-outline w-full rounded-xl normal-case text-base border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Sign Up
          </button>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <GoogleAuthButton />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Built for investors who think long term
        </p>
      </div>
    </Background>
  );
}

export default Main;
