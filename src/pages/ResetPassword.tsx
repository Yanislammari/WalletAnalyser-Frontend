import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import Background from "../components/Background";
import AuthService from "../services/AuthService";
import { PASSWORD_REGEX } from "../constants/regex";

const ResetPassword: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const authService = AuthService.getInstance();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isTokenProvided, setIsTokenProvided] = useState(true);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const verifyPasswordErrorMessage = "Password must contain at least 8 characters, including an uppercase, lowercase, number and special character.";

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error("Invalid or missing token.");
        setIsTokenProvided(false);
        return;
      }

      try {
        const isValid = await authService.verifyToken(token);
        if (!isValid) {
          setIsTokenExpired(true);
          toast.error("Your reset link has expired.");
        }
      }
      catch (error: any) {
        if (error.message === "TOKEN_EXPIRED") {
          setIsTokenExpired(true);
          toast.error("Your reset link has expired.");
        }
        else if (error.message === "INVALID_TOKEN") {
          setIsTokenInvalid(true);
          toast.error("The token is invalid.");
        }
        else {
          setIsTokenInvalid(true);
          toast.error("Invalid reset link.");
        }
      }
    };

    verifyToken();
  }, [token, authService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordError(null);
    setConfirmError(null);

    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }
    if (!password) {
      setPasswordError("Please enter a new password.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError(verifyPasswordErrorMessage);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(password, token);
      toast.success("Password successfully reset! You can now login.");
      navigate("/login");
    }
    catch (error: any) {
      switch (error.message) {
        case "TOKEN_EXPIRED":
          toast.error("Your reset link has expired. Please request a new one.");
          break;
        case "INVALID_TOKEN":
          toast.error("Invalid reset link.");
          break;
        case "RESET_PASSWORD_FAILED":
          toast.error("Error resetting password. Try again later.");
          break;
        default:
          toast.error("Something went wrong. Try again later.");
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const getInputBorderClass = (error: string | null) => error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500";

  return (
    <Background>
      <div className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-3xl shadow-xl p-10 w-full max-w-sm text-gray-900">
      {!isTokenProvided ? (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-500 mb-3">Token Missing</h1>
          <p className="opacity-80 mb-6">No token found. Please request a new reset link.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none"
          >
            Request New Link
          </button>
        </div>
      ) : isTokenInvalid ? (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-500 mb-3">Invalid Token</h1>
          <p className="opacity-80 mb-6">The reset link is invalid or tampered with.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none"
          >
            Request New Link
          </button>
        </div>
      ) : isTokenExpired ? (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-yellow-500 mb-3">Link Expired</h1>
          <p className="opacity-80 mb-6">Your reset link has expired. Request a new one to reset your password.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none"
          >
            Request New Link
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold text-center mb-4">Reset Password</h1>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-white/90 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${getInputBorderClass(
                passwordError
              )}`}
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`bg-white/90 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${getInputBorderClass(
                confirmError
              )}`}
            />
            {confirmError && <p className="text-red-500 text-sm mt-1">{confirmError}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : "Reset Password"}
          </button>
          <div className="text-center text-sm mt-1">
            <button
              onClick={() => navigate("/login")}
              className="text-purple-600 hover:underline hover:cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
      </div>
    </Background>
  );
}

export default ResetPassword;
