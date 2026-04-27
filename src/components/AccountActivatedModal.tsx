import React, { useEffect, useRef } from "react";
import { HiXMark, HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineChartBar, HiOutlinePresentationChartLine, HiOutlineTrophy, HiOutlineShieldCheck } from "react-icons/hi2";

interface AccountActivatedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  { label: "Portfolio tracking", Icon: HiOutlinePresentationChartLine },
  { label: "Performance metrics", Icon: HiOutlineChartBar },
  { label: "Benchmark comparison", Icon: HiOutlineTrophy },
  { label: "Risk analysis", Icon: HiOutlineShieldCheck },
];

const AccountActivatedModal: React.FC<AccountActivatedModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen) {
      dialog.showModal();
    }
    else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleNativeClose = () => onClose();
    dialog.addEventListener("close", handleNativeClose);
    return () => dialog.removeEventListener("close", handleNativeClose);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box relative overflow-visible p-0 max-w-md rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/60">
        <div className="relative px-7 pt-8 pb-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-t-2xl">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <HiOutlineCheckCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <HiOutlineSparkles className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-gray-900 font-bold text-xl text-center tracking-tight">
              Account activated!
            </h3>
            <HiOutlineSparkles className="w-5 h-5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-gray-500 text-sm text-center mt-2 leading-relaxed">
            Your account is now fully verified and active.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shadow-sm"
            aria-label="Close"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
        <div className="px-7 py-5 bg-white">
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to <span className="font-semibold text-gray-800">WalletAnalyser</span>! You now have full access to portfolio tracking, performance metrics, benchmark comparisons, and all other features.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {features.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl"
              >
                <Icon className="w-5 h-5 text-emerald-700 shrink-0" />
                <p className="text-[12px] text-emerald-800 font-medium leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-7 pb-6 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all shadow-sm shadow-emerald-200 cursor-pointer"
          >
            Start exploring
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

export default AccountActivatedModal;
