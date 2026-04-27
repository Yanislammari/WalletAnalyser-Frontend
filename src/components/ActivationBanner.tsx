import type React from "react";
import { HiXMark, HiOutlineEnvelope, HiOutlineExclamationTriangle } from "react-icons/hi2";

interface ActivationBannerProps {
  onClose: () => void;
  onSendEmail: () => void;
}

const ActivationBanner: React.FC<ActivationBannerProps> = (props: ActivationBannerProps) => {
  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 sm:px-5 py-3.5 flex items-start sm:items-center gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mt-0.5 sm:mt-0">
        <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 leading-snug">
          Your account is not activated
        </p>
        <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
          Activate your account to unlock portfolio tracking, performance metrics, and all other features. Check your inbox for the activation email.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          onClick={props.onSendEmail}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300/60 rounded-lg transition-colors cursor-pointer"
        >
          <HiOutlineEnvelope className="w-3.5 h-3.5" />
          Resend email
        </button>
        <button
          onClick={props.onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-800 hover:bg-amber-200/60 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ActivationBanner;
