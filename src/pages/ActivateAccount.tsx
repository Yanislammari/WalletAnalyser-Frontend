import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { HiOutlineExclamationTriangle, HiOutlineClock, HiOutlineXCircle } from "react-icons/hi2";
import AuthService from "../services/AuthService";
import Loading from "../components/Loading";
import { TokenErrorType } from "../enums/TokenErrorType";
import ErrorCard from "../components/ErrorCard";

const ActivateAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate: NavigateFunction = useNavigate();
  const authService: AuthService = AuthService.getInstance();
  const hasRun: React.RefObject<boolean> = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [errorType, setErrorType] = useState<TokenErrorType | null>(null);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;
    const token = searchParams.get("token");

    const verifyAndActivate = async () => {
      if (!token || token.trim() === "") {
        setErrorType(TokenErrorType.MISSING);
        setIsTokenValid(false);
        setLoading(false);
        toast.error("No activation token found in the URL.");
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
            toast.error("This activation link has expired. Please request a new one.");
            break;
          case "Invalid token":
            setErrorType(TokenErrorType.INVALID);
            toast.error("This activation link is invalid.");
            break;
          default:
            setErrorType(TokenErrorType.UNKNOWN);
            toast.error("Failed to verify activation link.");
            break;
        }

        setIsTokenValid(false);
        setLoading(false);
        return;
      }

      try {
        await authService.activateAccount(token);
        sessionStorage.setItem("accountJustActivated", "true");
        toast.success("Your account has been activated!");
        navigate("/home/dashboard", { replace: true });
      }
      catch (error: any) {
        switch (error.message) {
          case "Token expired":
            setErrorType(TokenErrorType.EXPIRED);
            toast.error("This activation link has expired. Please request a new one.");
            break;
          case "Invalid token":
            setErrorType(TokenErrorType.INVALID);
            toast.error("This activation link is invalid.");
            break;
          default:
            setErrorType(TokenErrorType.UNKNOWN);
            toast.error("Something went wrong while activating your account.");
            break;
        }

        setIsTokenValid(false);
        setLoading(false);
      }
    };

    verifyAndActivate();
  }, [searchParams, navigate, authService]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4fb] flex flex-col items-center justify-center gap-4">
        <Loading size={96} />
        <p className="text-gray-400 text-sm mt-4 animate-pulse">
          Verifying your activation link…
        </p>
      </div>
    );
  }
  if (isTokenValid === false) {
    if (errorType === TokenErrorType.MISSING) {
      return (
        <ErrorCard
          iconBg="bg-gray-100"
          icon={<HiOutlineXCircle className="w-8 h-8 text-gray-400" />}
          title="No token provided"
          description="The activation link appears to be incomplete. Make sure you copied the full link from your email."
          hint="The URL should look like: /activate-account?token=…"
        />
      );
    }
    if (errorType === TokenErrorType.EXPIRED) {
      return (
        <ErrorCard
          iconBg="bg-amber-100"
          icon={<HiOutlineClock className="w-8 h-8 text-amber-500" />}
          title="Link expired"
          description="This activation link has expired. Activation links are valid for 24 hours."
          hint="Log in to your account and request a new activation email from your dashboard."
        />
      );
    }
    if (errorType === TokenErrorType.INVALID) {
      return (
        <ErrorCard
          iconBg="bg-red-100"
          icon={<HiOutlineExclamationTriangle className="w-8 h-8 text-red-500" />}
          title="Invalid activation link"
          description="This activation link is not valid. It may have already been used or the URL is malformed."
        />
      );
    }

    return (
      <ErrorCard
        iconBg="bg-red-100"
        icon={<HiOutlineXCircle className="w-8 h-8 text-red-500" />}
        title="Activation failed"
        description="Something went wrong while activating your account. Please try again or contact support."
      />
    );
  }

  return null;
}

export default ActivateAccount;
