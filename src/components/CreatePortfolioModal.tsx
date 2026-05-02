import React from "react";
import { HiOutlineBriefcase, HiOutlineXMark } from "react-icons/hi2";

interface CreatePortfolioModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  newName: string;
  creating: boolean;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = (props: CreatePortfolioModalProps) => {
  return (
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">New portfolio</h3>
          </div>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            type="button"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Portfolio name
            </label>
            <input
              type="text"
              value={props.newName}
              onChange={(e) => props.onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && props.onCreate()}
              placeholder="e.g. Long-term growth"
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={props.onClose}
              type="button"
              className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={props.onCreate}
              type="button"
              disabled={!props.newName.trim() || props.creating}
              className="flex-1 py-2.5 text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer"
            >
              {props.creating ? (
                <span className="loading loading-spinner loading-xs text-white" />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default CreatePortfolioModal;
