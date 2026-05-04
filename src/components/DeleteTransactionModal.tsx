import React from "react";
import { HiOutlineTrash, HiOutlineXMark } from "react-icons/hi2";

interface DeleteTransactionModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = (props) => {
  return (
    <dialog ref={props.dialogRef} className="modal">
      <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <HiOutlineTrash className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">Delete transaction</h3>
          </div>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            type="button"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this transaction? This action is permanent and cannot be undone.
        </p>

        <div className="flex gap-2">
          <button
            onClick={props.onClose}
            type="button"
            disabled={props.deleting}
            className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={props.onConfirm}
            type="button"
            disabled={props.deleting}
            className="flex-1 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer"
          >
            {props.deleting ? (
              <span className="loading loading-spinner loading-xs text-white" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default DeleteTransactionModal;
