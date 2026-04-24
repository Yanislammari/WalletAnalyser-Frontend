import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import Background from "../components/Background";
import AuthService from "../services/AuthService";
import { PASSWORD_REGEX } from "../constants/regex";
import { TokenErrorType } from "../enums/TokenErrorType";

const ResetPassword: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const authService: AuthService = AuthService.getInstance();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [errorType, setErrorType] = useState<TokenErrorType | null>(null);
  const [searchParams] = useSearchParams();
  const token: string | null = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || token.trim() === "") {
        setErrorType(TokenErrorType.MISSING);
        toast.error("Reset link is missing.");
        setIsTokenValid(false);
        return;
      }

      try {
        await authService.verifyToken(token);
        setIsTokenValid(true);
      }
      catch (error: any) {
        switch (error.message) {
          case "Token expired":
            setErrorType(TokenErrorType.EXPIRED);
            toast.error("Your reset link has expired.");
            break;
          case "Invalid token":
            setErrorType(TokenErrorType.INVALID);
            toast.error("This reset link is invalid.");
            break;
          default:
            setErrorType(TokenErrorType.UNKNOWN);
            toast.error("Failed to verify reset link.");
        }
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleResetPassword = async () => {
    if (!token || token.trim() === "") {
      toast.error("Reset link is missing.");
      return;
    }
    if (!password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast.error(
        "Password must be 8+ chars, include upper, lower, number & special char."
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(password, token);
      toast.success("Password successfully reset!");
      navigate("/login");
    }
    catch (error: any) {
      switch (error.message) {
        case "Token expired":
          toast.error("Your reset link has expired.");
          break;
        case "Invalid token":
          toast.error("This reset link is invalid.");
          break;
        default:
          toast.error("Something went wrong. Try again later.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200 rounded-3xl shadow-xl p-10 w-full max-w-sm text-gray-900">
        {isTokenValid === false ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-500 mb-3">
              {errorType === TokenErrorType.MISSING && "Missing Reset Link"}
              {errorType === TokenErrorType.EXPIRED && "Expired Reset Link"}
              {errorType === TokenErrorType.INVALID && "Invalid Reset Link"}
              {errorType === TokenErrorType.UNKNOWN && "Reset Link Error"}
              {!errorType && "Reset Link Error"}
            </h1>
            <p className="opacity-80 mb-6">
              {errorType === TokenErrorType.MISSING && "The reset link is incomplete or missing."}
              {errorType === TokenErrorType.EXPIRED && "Your reset link has expired. Please request a new one."}
              {errorType === TokenErrorType.INVALID && "This reset link is not valid."}
              {errorType === TokenErrorType.UNKNOWN && "An unknown error occurred with the reset link."}
              {!errorType && "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none"
            >
              Request New Link
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-center">
              Reset Password
            </h1>
            <div className="flex items-center w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="flex items-center w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin mx-auto" />
              ) : (
                "Reset Password"
              )}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-outline w-full rounded-xl normal-case text-base border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </Background>
  );
}

export default ResetPassword;
