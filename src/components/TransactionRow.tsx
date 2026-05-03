import React, { type JSX } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";

interface BuyRowProps {
  variant: "buy";
  row: AssetBuyResponse;
  currencyName: (id: string) => string;
  onDelete: () => void;
}

interface SellRowProps {
  variant: "sell";
  row: AssetSellResponse;
  currencyName: (id: string) => string;
  onDelete: () => void;
}

interface DividendRowProps {
  variant: "dividend";
  row: AssetDividendResponse;
  currencyName: (id: string) => string;
  onDelete: () => void;
}

type TransactionRowProps = BuyRowProps | SellRowProps | DividendRowProps;

const TransactionRow: React.FC<TransactionRowProps> = (props: TransactionRowProps) => {
  const deleteBtn: JSX.Element = (
    <td className="py-3 text-right">
      <button
        onClick={props.onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer"
      >
        <HiOutlineTrash size={15} />
      </button>
    </td>
  );

  if (props.variant === "buy") {
    const { row, currencyName } = props;
    return (
      <tr className="group hover:bg-gray-50 transition-colors">
        <td className="py-3 pr-4 text-gray-700">{row.buyDate}</td>
        <td className="py-3 pr-4 text-gray-900 font-medium">{row.companyName ?? "—"}</td>
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
    );
  }

  if (props.variant === "sell") {
    const { row, currencyName } = props;
    return (
      <tr className="group hover:bg-gray-50 transition-colors">
        <td className="py-3 pr-4 text-gray-700">{row.sellDate}</td>
        <td className="py-3 pr-4 text-gray-900 font-medium">{row.companyName ?? "—"}</td>
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
    );
  }

  const { row, currencyName } = props;
  return (
    <tr className="group hover:bg-gray-50 transition-colors">
      <td className="py-3 pr-4 text-gray-700">{row.cashflowDate}</td>
      <td className="py-3 pr-4 text-indigo-600 font-medium">{row.cashflowAmount}</td>
      <td className="py-3 pr-4 text-gray-700">{currencyName(row.currencyId)}</td>
      {deleteBtn}
    </tr>
  );
}

export default TransactionRow;
