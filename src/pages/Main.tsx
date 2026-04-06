import React from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import Background from "../components/Background";
import { useAuth } from "../providers/AuthProvider";

const Main: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("No Google token received.");
      return;
    }

    try {
      await loginWithGoogle(idToken);
      navigate("/home");
    }
    catch {
      toast.error("Error logging in with Google.");
    }
  };

  return (
    <Background>
      <div className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-3xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Wallet<span className="text-purple-600">Analyser</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Analyse, compare et optimise tes investissements
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
          <div className="relative">
            <button className="btn bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 w-full rounded-xl normal-case flex items-center justify-center gap-2">
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            <div className="absolute inset-0 opacity-0">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed.")}
                text="continue_with"
                shape="rectangular"
                size="large"
                useOneTap={false}
              />
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Built for investors who think long term
        </p>
      </div>
    </Background>
  );
}

export default Main;
