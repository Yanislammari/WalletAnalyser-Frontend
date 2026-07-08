import React, { useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { HiOutlineTrash, HiOutlinePencilSquare } from "react-icons/hi2";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import DeleteTransactionModal from "./DeleteTransactionModal";
import CompanyLogo from "./CompanyLogo";
import { toast } from "sonner";
import { computeBuyAmount } from "../utils/transactionSort";

interface BuyRowProps {
  variant: "buy";
  row: AssetBuyResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
  onEdit: (row: AssetBuyResponse) => void;
}

interface SellRowProps {
  variant: "sell";
  row: AssetSellResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
  onEdit: (row: AssetSellResponse) => void;
}

interface DividendRowProps {
  variant: "dividend";
  row: AssetDividendResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
  onEdit: (row: AssetDividendResponse) => void;
}

type TransactionRowProps = BuyRowProps | SellRowProps | DividendRowProps;

const TransactionRow: React.FC<TransactionRowProps> = (props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDeleteClick = () => dialogRef.current?.showModal();

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await props.onDelete();
      dialogRef.current?.close();
      toast.success("Transaction deleted.");
    } catch {
      toast.error("Failed to delete transaction.");
    } finally {
      setDeleting(false);
    }
  };

  const actionBtns = (onEditClick: () => void): JSX.Element => (
    <td className="py-3 px-2 text-center w-20">
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={onEditClick}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
          title="Edit transaction"
        >
          <HiOutlinePencilSquare size={16} />
        </button>
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          title="Delete transaction"
        >
          <HiOutlineTrash size={16} />
        </button>
      </div>
    </td>
  );

  const formatBuyAmount = (row: AssetBuyResponse, cn: (id: string) => string): string => {
    const amount = computeBuyAmount(row);
    return amount != null ? `${parseFloat(amount.toFixed(2))} ${cn(row.buyCurrencyId)}` : "—";
  };

  if (props.variant === "buy") {
    const { row, currencyName, onEdit } = props;
    return (
      <>
        <tr className="group hover:bg-gray-50 transition-colors">
          <td className="py-3 pr-4 text-gray-700">{row.buyDate}</td>
          <td className="py-3 pr-4">
            <div className="flex items-center gap-2">
              {row.companyName && <CompanyLogo name={row.companyName} size={26} />}
              <span className="text-gray-900 font-medium">{row.companyName ?? "—"}</span>
            </div>
          </td>
          <td className="py-3 pr-4 text-gray-700">{row.assetBuyShare != null ? `${row.assetBuyShare}` : "—"}</td>
          <td className="py-3 pr-4 text-gray-700">{row.assetBuyPricePerShare != null ? `${row.assetBuyPricePerShare}` : "—"}</td>
          <td className="py-3 pr-4 font-medium text-gray-900">{formatBuyAmount(row, currencyName)}</td>
          {actionBtns(() => onEdit(row))}
        </tr>
        {createPortal(
          <DeleteTransactionModal dialogRef={dialogRef} deleting={deleting} onConfirm={handleConfirm} onClose={() => dialogRef.current?.close()} />,
          document.body
        )}
      </>
    );
  }

  if (props.variant === "sell") {
    const { row, currencyName, onEdit } = props;
    const sellPricePerShare: number | null =
      row.assetSellAmount != null && row.assetSellShare != null && row.assetSellShare > 0
        ? parseFloat((row.assetSellAmount / row.assetSellShare).toFixed(4))
        : null;
    return (
      <>
        <tr className="group hover:bg-gray-50 transition-colors">
          <td className="py-3 pr-4 text-gray-700">{row.sellDate}</td>
          <td className="py-3 pr-4">
            <div className="flex items-center gap-2">
              {row.companyName && <CompanyLogo name={row.companyName} size={26} />}
              <span className="text-gray-900 font-medium">{row.companyName ?? "—"}</span>
            </div>
          </td>
          <td className="py-3 pr-4 text-gray-700">
            {row.assetSellShare != null ? row.assetSellShare : "—"}
          </td>
          <td className="py-3 pr-4 text-gray-700">
            {sellPricePerShare != null ? `${sellPricePerShare} ${currencyName(row.sellCurrencyId)}` : "—"}
          </td>
          <td className="py-3 pr-4 text-gray-700">
            {row.assetSellAmount != null ? `${parseFloat(row.assetSellAmount.toFixed(2))} ${currencyName(row.sellCurrencyId)}` : "—"}
          </td>
          <td className="py-3 pr-4">
            {row.assetSellGain != null ? (
              <span className={row.assetSellGain >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {row.assetSellGain >= 0 ? "+" : ""}{row.assetSellGain} {currencyName(row.sellCurrencyId)}
              </span>
            ) : "—"}
          </td>
          {actionBtns(() => onEdit(row))}
        </tr>
        {createPortal(
          <DeleteTransactionModal dialogRef={dialogRef} deleting={deleting} onConfirm={handleConfirm} onClose={() => dialogRef.current?.close()} />,
          document.body
        )}
      </>
    );
  }

  const { row, currencyName, onEdit } = props;
  const today = new Date().toISOString().split("T")[0];
  const isUpcoming = row.cashflowDate > today;
  return (
    <>
      <tr className={`group transition-colors ${isUpcoming ? "opacity-50" : "hover:bg-gray-50"}`}>
        <td className="py-3 pr-4 text-gray-700">
          <div className="flex items-center gap-2">
            <span>{row.cashflowDate}</span>
            {isUpcoming && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                Upcoming
              </span>
            )}
          </div>
        </td>
        <td className="py-3 pr-4">
          {row.companyName ? (
            <div className="flex items-center gap-2">
              <CompanyLogo name={row.companyName} size={26} />
              <span className={`font-medium ${isUpcoming ? "text-gray-500" : "text-gray-900"}`}>{row.companyName}</span>
            </div>
          ) : <span className="text-gray-400">—</span>}
        </td>
        <td className={`py-3 pr-4 font-medium ${isUpcoming ? "text-gray-400" : "text-indigo-600"}`}>{row.cashflowAmount}</td>
        <td className="py-3 pr-4 text-gray-700">{currencyName(row.currencyId)}</td>
        {actionBtns(() => onEdit(row))}
      </tr>
      {createPortal(
        <DeleteTransactionModal dialogRef={dialogRef} deleting={deleting} onConfirm={handleConfirm} onClose={() => dialogRef.current?.close()} />,
        document.body
      )}
    </>
  );
};

export default TransactionRow;
