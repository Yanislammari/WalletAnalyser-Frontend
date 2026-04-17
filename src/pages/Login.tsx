import React, { useState } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import Background from "../components/Background";
import { useAuth } from "../providers/AuthProvider";
import GoogleAuthButton from "../components/GoogleAuthButton";
import BackButton from "../components/BackButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const getErrorMessage = (backendMessage: string): string => {
    switch (backendMessage) {
      case "Invalid email credentials":
        return "Email not found. Please check your email.";
      case "Password not set for this user":
        return "This account does not have a password set yet.";
      case "Invalid password credentials":
        return "Incorrect password. Please try again.";
      case "Email already exists":
        return "An account with this email already exists.";
      case "Username already exists":
        return "This username is already taken.";
      default:
        return "Something went wrong. Please try again later.";
    }
  };  

  const handleLogin = async () => {
    if (!email && !password) {
      toast.error("Email and password are required.");
      return;
    }
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/home");
    }
    catch (error: any) {
      const message = getErrorMessage(error.message);
      toast.error(message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200 rounded-3xl shadow-xl p-10 w-full max-w-sm text-gray-900">
        <BackButton route="/main" />
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">
            Login to Wallet<span className="text-purple-600">Analyser</span>
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
          <div className="text-center">
            <button
              className="text-sm text-purple-600 hover:underline hover:cursor-pointer"
              onClick={() => navigate("/forgotten-password")}
            >
              Forgotten Password?
            </button>
          </div>
          <button
            onClick={handleLogin}
            className={`btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Login"}
          </button>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          <GoogleAuthButton />
          <div className="text-center text-sm">
            No account?{" "}
            <button
              className="text-purple-600 hover:underline hover:cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign up here!
            </button>
          </div>
        </div>
      </div>
    </Background>
  );
}

export default Login;
