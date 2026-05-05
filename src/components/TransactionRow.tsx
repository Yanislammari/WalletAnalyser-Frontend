import React, { useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { HiOutlineTrash } from "react-icons/hi2";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import DeleteTransactionModal from "./DeleteTransactionModal";
import CompanyLogo from "./CompanyLogo";
import { toast } from "sonner";

interface BuyRowProps {
  variant: "buy";
  row: AssetBuyResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
}

interface SellRowProps {
  variant: "sell";
  row: AssetSellResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
}

interface DividendRowProps {
  variant: "dividend";
  row: AssetDividendResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
}

type TransactionRowProps = BuyRowProps | SellRowProps | DividendRowProps;

const TransactionRow: React.FC<TransactionRowProps> = (props: TransactionRowProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDeleteClick = () => {
    dialogRef.current?.showModal();
  };

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await props.onDelete();
      dialogRef.current?.close();
      toast.success("Transaction deleted.");
    }
    catch {
      toast.error("Failed to delete transaction.");
    }
    finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    dialogRef.current?.close();
  };

  const deleteBtn: JSX.Element = (
    <td className="py-3 px-2 text-center w-10">
      <button
        onClick={handleDeleteClick}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
        title="Delete transaction"
      >
        <HiOutlineTrash size={16} />
      </button>
    </td>
  );

  if (props.variant === "buy") {
    const { row, currencyName } = props;
    return (
      <>
        <tr className="group hover:bg-gray-50 transition-colors">
          <td className="py-3 pr-4 text-gray-700">{row.buyDate}</td>
          <td className="py-3 pr-4">
            <div className="flex items-center gap-2">
              {row.companyName && <CompanyLogo name={row.companyName} size={32} />}
              <span className="text-gray-900 font-medium">{row.companyName ?? "—"}</span>
            </div>
          </td>
          <td className="py-3 pr-4 text-gray-700">
            {row.assetBuyAmount != null
              ? `${row.assetBuyAmount} ${currencyName(row.buyCurrencyId)}`
              : row.assetBuyShare != null
              ? `${row.assetBuyShare} shares`
              : "—"}
          </td>
          <td className="py-3 pr-4 text-gray-700">
            {row.assetBuyPricePerShare != null ? `${row.assetBuyPricePerShare}` : "—"}
          </td>
          {deleteBtn}
        </tr>
        {createPortal(
          <DeleteTransactionModal
            dialogRef={dialogRef}
            deleting={deleting}
            onConfirm={handleConfirm}
            onClose={handleClose}
          />,
          document.body
        )}
      </>
    );
  }

  if (props.variant === "sell") {
    const { row, currencyName } = props;
    return (
      <>
        <tr className="group hover:bg-gray-50 transition-colors">
          <td className="py-3 pr-4 text-gray-700">{row.sellDate}</td>
          <td className="py-3 pr-4">
            <div className="flex items-center gap-2">
              {row.companyName && <CompanyLogo name={row.companyName} size={32} />}
              <span className="text-gray-900 font-medium">{row.companyName ?? "—"}</span>
            </div>
          </td>
          <td className="py-3 pr-4 text-gray-700">
            {row.assetSellAmount != null
              ? `${row.assetSellAmount} ${currencyName(row.sellCurrencyId)}`
              : row.assetSellShare != null
              ? `${row.assetSellShare} shares`
              : "—"}
          </td>
          <td className="py-3 pr-4">
            {row.assetSellGain != null ? (
              <span className={row.assetSellGain >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {row.assetSellGain >= 0 ? "+" : ""}{row.assetSellGain} {currencyName(row.sellCurrencyId)}
              </span>
            ) : "—"}
          </td>
          {deleteBtn}
        </tr>
        {createPortal(
          <DeleteTransactionModal
            dialogRef={dialogRef}
            deleting={deleting}
            onConfirm={handleConfirm}
            onClose={handleClose}
          />,
          document.body
        )}
      </>
    );
  }

  const { row, currencyName } = props;
  return (
    <>
      <tr className="group hover:bg-gray-50 transition-colors">
        <td className="py-3 pr-4 text-gray-700">{row.cashflowDate}</td>
        <td className="py-3 pr-4 text-indigo-600 font-medium">{row.cashflowAmount}</td>
        <td className="py-3 pr-4 text-gray-700">{currencyName(row.currencyId)}</td>
        {deleteBtn}
      </tr>
      {createPortal(
        <DeleteTransactionModal
          dialogRef={dialogRef}
          deleting={deleting}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />,
        document.body
      )}
    </>
  );
}

export default TransactionRow;
