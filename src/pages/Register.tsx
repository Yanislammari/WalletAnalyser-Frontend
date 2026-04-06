import React, { useState } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import Background from "../components/Background";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/regex";
import { useAuth } from "../providers/AuthProvider";

const Register: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const getErrorMessage = (backendMessage: string): string => {
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

    setLoading(true);
    try {
      register({firstName, lastName, email, password});
      toast.success("Account created successfully!");
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
      <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-3xl shadow-xl p-10 w-full max-w-sm text-gray-900">
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
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleRegister}
            className={`btn bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl normal-case text-base border-none ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Register"}
          </button>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
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
    </Background>
  );
}

export default Register;
