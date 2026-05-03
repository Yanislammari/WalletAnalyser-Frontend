import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import { TABS, tabAccent } from "../constants/transactionConstants";
import TransactionRow from "./TransactionRow";
import Loading from "./Loading";
import { TabType } from "../enums/TabType";

interface TransactionTableProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  buys: AssetBuyResponse[];
  sells: AssetSellResponse[];
  dividends: AssetDividendResponse[];
  loading: boolean;
  onAdd: () => void;
  onDeleteBuy: (id: string) => void;
  onDeleteSell: (id: string) => void;
  onDeleteDividend: (id: string) => void;
  currencyName: (id: string) => string;
}

interface EmptyTableProps {
  onAdd: () => void;
  label: string;
}

const EmptyTable: React.FC<EmptyTableProps> = ({ onAdd, label }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
      <HiOutlinePlus className="w-5 h-5 text-gray-400" />
    </div>
    <div className="text-center">
      <p className="text-gray-600 font-medium text-sm">No {label} yet</p>
      <p className="text-gray-400 text-xs mt-0.5">Click + to add a row</p>
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-1.5 px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl font-medium transition-colors cursor-pointer"
    >
      <HiOutlinePlus size={15} /> Add
    </button>
  </div>
);

const TransactionTable: React.FC<TransactionTableProps> = (props: TransactionTableProps) => {
  const count = (tab: TabType) =>
    tab === TabType.BUYS ? props.buys.length : tab === TabType.SELLS ? props.sells.length : props.dividends.length;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100 px-4 pt-4 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => props.onTabChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-xl transition-all cursor-pointer ${
              props.activeTab === tab.key
                ? "bg-gray-50 text-gray-900 border border-b-0 border-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className={props.activeTab === tab.key ? tabAccent[tab.key].badge.split(" ")[0] : ""}>
              {tab.icon}
            </span>
            {tab.label}
            {count(tab.key) > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${tabAccent[tab.key].badge}`}>
                {count(tab.key)}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="p-4">
        {props.loading ? (
          <div className="flex justify-center py-8">
            <Loading size={96} />
          </div>
        ) : (
          <div>
            {props.activeTab === TabType.BUYS && (
              props.buys.length === 0 ? (
                <EmptyTable onAdd={props.onAdd} label="buys" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-widest">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Company</th>
                        <th className="pb-3 pr-4 font-medium">Amount / Shares</th>
                        <th className="pb-3 pr-4 font-medium">Price / share</th>
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {props.buys.map((row) => (
                        <TransactionRow
                          key={row.id}
                          variant="buy"
                          row={row}
                          currencyName={props.currencyName}
                          onDelete={() => props.onDeleteBuy(row.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={props.onAdd}
                    className="mt-3 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors"
                  >
                    <HiOutlinePlus size={15} /> Add a row
                  </button>
                </div>
              )
            )}
            {props.activeTab === TabType.SELLS && (
              props.sells.length === 0 ? (
                <EmptyTable onAdd={props.onAdd} label="sells" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-widest">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Company</th>
                        <th className="pb-3 pr-4 font-medium">Amount / Shares</th>
                        <th className="pb-3 pr-4 font-medium">Capital gain</th>
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {props.sells.map((row) => (
                        <TransactionRow
                          key={row.id}
                          variant="sell"
                          row={row}
                          currencyName={props.currencyName}
                          onDelete={() => props.onDeleteSell(row.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={props.onAdd}
                    className="mt-3 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors"
                  >
                    <HiOutlinePlus size={15} /> Add a row
                  </button>
                </div>
              )
            )}
            {props.activeTab === TabType.DIVIDENDS && (
              props.dividends.length === 0 ? (
                <EmptyTable onAdd={props.onAdd} label="dividends" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-widest">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Amount</th>
                        <th className="pb-3 pr-4 font-medium">Currency</th>
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {props.dividends.map((row) => (
                        <TransactionRow
                          key={row.id}
                          variant="dividend"
                          row={row}
                          currencyName={props.currencyName}
                          onDelete={() => props.onDeleteDividend(row.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={props.onAdd}
                    className="mt-3 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors"
                  >
                    <HiOutlinePlus size={15} /> Add a row
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
