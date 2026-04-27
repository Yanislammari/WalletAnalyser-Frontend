import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import React from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";

const GoogleAuthButton: React.FC = () => {
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
      toast.success("Logged in with Google successfully!");
      navigate("/home");
    }
    catch {
      toast.error("Error logging in with Google.");
    }
  };
  
  return (
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
  );
}

export default GoogleAuthButton;
