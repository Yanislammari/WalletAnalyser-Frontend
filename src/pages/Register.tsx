import React, { useState, useEffect } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { FaCheck, FaTimes, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import Background from "../components/Background";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/regex";
import { useAuth } from "../providers/AuthProvider";
import AuthService from "../services/AuthService";
import GoogleAuthButton from "../components/GoogleAuthButton";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";

const Register: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const { register } = useAuth();
  const authService = AuthService.getInstance();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const DEBOUNCE_DELAY = 600;

  useEffect(() => {
    if (!EMAIL_REGEX.test(email)) {
      setIsEmailAvailable(null);
      return;
    }

    const delay = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const res = await authService.checkEmailAvailability(email);
        setIsEmailAvailable(res.available);
      }
      catch {
        setIsEmailAvailable(null);
      }
      finally {
        setIsCheckingEmail(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(delay);
  }, [email]);

  const getBackendErrorMessage = (backendMessage: string): string => {
    switch (backendMessage) {
      case "Email already exists":
        return "An account with this email already exists.";
      default:
        return "Something went wrong. Please try again later.";
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      toast.error("All fields are required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast.error(
        "Password must be 8+ chars, include upper, lower, number & special char."
      );
      return;
    }
    if (isEmailAvailable === false) {
      toast.error("Email is already taken.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, email, password });
      toast.success("Account created successfully!");
      navigate("/home");
    }
    catch (error: any) {
      toast.error(getBackendErrorMessage(error.message));
    }
    finally {
      setLoading(false);
    }
  };

  const getBorderColor = () => {
    if (isEmailAvailable === true) return "border-green-500 focus:ring-green-500";
    if (isEmailAvailable === false) return "border-red-500 focus:ring-red-500";
    return "border-gray-300 focus:ring-purple-500";
  };

  return (
    <Background>
      {loading ? (
        <Loading size={96} />
      ) : (
        <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200 rounded-3xl shadow-xl p-10 w-full max-w-sm text-gray-900">
          <BackButton route="/main" />
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">
              Register for Wallet<span className="text-purple-600">Analyser</span>
            </h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 px-4 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 px-4 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-full">
              <div
                className={`flex items-center w-full px-4 py-3 rounded-xl bg-white/90 border ${getBorderColor()} 
                  focus-within:ring-2 focus-within:ring-offset-1 ${
                    isEmailAvailable === true
                      ? "focus-within:ring-green-500"
                      : isEmailAvailable === false
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
                  ) : isEmailAvailable === true ? (
                    <FaCheck className="w-5 h-5 text-green-500" />
                  ) : isEmailAvailable === false ? (
                    <FaTimes className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {isEmailAvailable !== null && !isCheckingEmail && (
                <p
                  className={`text-sm font-semibold mt-1 ${
                    isEmailAvailable ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isEmailAvailable
                    ? "Email is available."
                    : "Email is already taken."}
                </p>
              )}
            </div>
            <div className="flex items-center w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              onClick={handleRegister}
              className={`btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Register"
              )}
            </button>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
            <GoogleAuthButton />
            <div className="text-center text-sm">
              Already have an account?{" "}
              <button
                className="text-purple-600 hover:underline hover:cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login here!
              </button>
            </div>
          </div>
        </div>
      )}
    </Background>
  );
}

export default Register;
