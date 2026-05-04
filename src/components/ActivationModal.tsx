import React, { useEffect, useRef } from "react";
import { HiXMark, HiOutlineEnvelope, HiOutlineExclamationTriangle } from "react-icons/hi2";

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = (props: ActivationModalProps) => {
  const dialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (props.isOpen) {
      dialog.showModal();
    }
    else {
      dialog.close();
    }
  }, [props.isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleNativeClose = () => props.onClose();
    dialog.addEventListener("close", handleNativeClose);
    return () => dialog.removeEventListener("close", handleNativeClose);
  }, [props.onClose]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box relative overflow-visible p-0 max-w-md rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/60">
        <div className="relative px-7 pt-8 pb-6 bg-gradient-to-br from-amber-50 via-orange-50 to-white rounded-t-2xl">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <HiOutlineExclamationTriangle className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
            </div>
          </div>
          <h3 className="text-gray-900 font-bold text-xl text-center tracking-tight">
            Activate your account
          </h3>
          <p className="text-gray-500 text-sm text-center mt-2 leading-relaxed">
            Your account hasn't been activated yet.
          </p>
          <button
            onClick={props.onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shadow-sm"
            aria-label="Close"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
        <div className="px-7 py-5 bg-white">
          <p className="text-gray-600 text-sm leading-relaxed">
            To unlock the full power of <span className="font-semibold text-gray-800">WalletAnalyser</span> — including portfolio tracking, performance metrics, and benchmark comparisons — please activate your account by clicking the link we sent to your email.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <HiOutlineEnvelope className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-700 leading-relaxed">
              Didn't receive the email? Check your spam folder, or request a new activation link below.
            </p>
          </div>
        </div>
        <div className="px-7 pb-6 bg-white rounded-b-2xl flex items-center gap-3">
          <button
            onClick={props.onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={props.onSendEmail}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-purple-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <HiOutlineEnvelope className="w-4 h-4" />
            Send email
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={props.onClose}>close</button>
      </form>
    </dialog>
  );
}

export default ActivationModal;
