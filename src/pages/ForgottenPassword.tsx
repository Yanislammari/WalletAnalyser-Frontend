import React, { useState, useEffect } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import Background from "../components/Background";
import { EMAIL_REGEX } from "../constants/regex";
import AuthService from "../services/AuthService";

const ForgottenPassword: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const authService = AuthService.getInstance();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const DEBOUNCE_DELAY = 600;

  useEffect(() => {
    if (!EMAIL_REGEX.test(email)) {
      setIsEmailValid(null);
      return;
    }

    const delay = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const res = await authService.checkEmailAvailability(email);
        setIsEmailValid(!res.available);
      }
      catch {
        setIsEmailValid(null);
      }
      finally {
        setIsCheckingEmail(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(delay);
  }, [email]);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (isEmailValid === false) {
      toast.error("This email is not registered.");
      return;
    }

    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      toast.success("Password reset link sent! Check your inbox.");
    }
    catch {
      toast.error("Error sending reset link. Please try again later.");
    }
    finally {
      setLoading(false);
    }
  };

  const getBorderColor = () => {
    if (isEmailValid === true) return "border-green-500 focus:ring-green-500";
    if (isEmailValid === false) return "border-red-500 focus:ring-red-500";
    return "border-gray-300 focus:ring-purple-500";
  };

  return (
    <Background>
      <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-3xl shadow-xl p-10 w-full max-w-sm text-gray-900">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">
            Forgotten Password
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col w-full">
            <div
              className={`flex items-center w-full px-4 py-3 rounded-xl bg-white/90 border ${getBorderColor()} 
                focus-within:ring-2 focus-within:ring-offset-1 ${
                  isEmailValid === true
                    ? "focus-within:ring-green-500"
                    : isEmailValid === false
                    ? "focus-within:ring-red-500"
                    : "focus-within:ring-purple-500"
                } transition-colors duration-200`}
            >
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="ml-2 flex-shrink-0">
                {isCheckingEmail ? (
                  <FaSpinner className="w-5 h-5 animate-spin text-gray-400" />
                ) : isEmailValid === true ? (
                  <FaCheck className="w-5 h-5 text-green-500" />
                ) : isEmailValid === false ? (
                  <FaTimes className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            </div>
            {isEmailValid !== null && !isCheckingEmail && (
              <p
                className={`text-sm font-semibold mt-1 ${
                  isEmailValid ? "text-green-500" : "text-red-500"
                }`}
              >
                {isEmailValid
                  ? "Email exists."
                  : "Email is not registered."}
              </p>
            )}
          </div>
          <button
            onClick={handleResetPassword}
            className={`btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Send Email"
            )}
          </button>
          <div className="text-center text-sm mt-4">
            Remember your password?{" "}
            <button
              className="text-purple-600 hover:underline hover:cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login here!
            </button>
          </div>
        </div>
      </div>
    </Background>
  );
}

export default ForgottenPassword;
