import React, { useState } from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import CompanyFilter from "./CompanyFilter";
import DateRangeFilter from "./DateRangeFilter";
import Pagination from "./Pagination";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import type { SortState } from "../models/items/SortState";
import { TABS, tabAccent } from "../constants/transactionConstants";
import { toggleSort, sortBuys, sortSells, sortDividends } from "../utils/transactionSort";
import TransactionRow from "./TransactionRow";
import SortableHeader from "./SortableHeader";
import EmptyTable from "./EmptyTable";
import Loading from "./Loading";
import { TabType } from "../enums/TabType";

const PAGE_SIZE: number = 10;

interface TransactionTableProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  buys: AssetBuyResponse[];
  sells: AssetSellResponse[];
  dividends: AssetDividendResponse[];
  buyTotal: number;
  sellTotal: number;
  dividendTotal: number;
  buyPage: number;
  sellPage: number;
  dividendPage: number;
  onBuyPageChange: (page: number) => void;
  onSellPageChange: (page: number) => void;
  onDividendPageChange: (page: number) => void;
  loading: boolean;
  onAdd: () => void;
  onDeleteBuy: (id: string) => Promise<void>;
  onDeleteSell: (id: string) => Promise<void>;
  onDeleteDividend: (id: string) => Promise<void>;
  currencyName: (id: string) => string;
  companies: string[];
  selectedCompany: string | null;
  onCompanyChange: (company: string | null) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  hasAnyBuys: boolean;
  hasAnySells: boolean;
  hasAnyDividends: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = (props: TransactionTableProps) => {
  const [buySortState, setBuySortState] = useState<SortState | null>(null);
  const [sellSortState, setSellSortState] = useState<SortState | null>(null);
  const [dividendSortState, setDividendSortState] = useState<SortState | null>(null);
  const handleBuySort = (key: string) => setBuySortState((prev) => toggleSort(prev, key));
  const handleSellSort = (key: string) => setSellSortState((prev) => toggleSort(prev, key));
  const handleDividendSort = (key: string) => setDividendSortState((prev) => toggleSort(prev, key));
  const sortedBuys: AssetBuyResponse[] = sortBuys(props.buys, buySortState);
  const sortedSells: AssetSellResponse[] = sortSells(props.sells, sellSortState);
  const sortedDividends: AssetDividendResponse[] = sortDividends(props.dividends, dividendSortState, props.currencyName);
  const isFiltered: boolean = !!props.selectedCompany || !!props.dateFrom || !!props.dateTo;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-4">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const total = tab.key === TabType.BUYS ? props.buyTotal : tab.key === TabType.SELLS ? props.sellTotal : props.dividendTotal;
            return (
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
                {total > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${tabAccent[tab.key].badge}`}>
                    {total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <DateRangeFilter
            from={props.dateFrom}
            to={props.dateTo}
            onFromChange={props.onDateFromChange}
            onToChange={props.onDateToChange}
          />
          <CompanyFilter
            companies={props.companies}
            selected={props.selectedCompany}
            onChange={props.onCompanyChange}
          />
        </div>
      </div>

      <div className="p-4">
        {props.loading ? (
          <div className="flex justify-center py-8">
            <Loading size={96} />
          </div>
        ) : (
          <div>
            {props.activeTab === TabType.BUYS && (
              !props.hasAnyBuys && !isFiltered ? (
                <EmptyTable onAdd={props.onAdd} label="buys" />
              ) : props.buys.length === 0 ? (
                <EmptyTable onAdd={props.onAdd} label="buys" filtered={!!props.selectedCompany} dateFiltered={!props.selectedCompany && (!!props.dateFrom || !!props.dateTo)} selectedCompany={props.selectedCompany} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-widest">
                        <SortableHeader
                          label="Date"
                          columnKey="date"
                          sortState={buySortState}
                          onSort={handleBuySort}
                        />
                        <SortableHeader
                          label="Company"
                          columnKey="company"
                          sortState={buySortState}
                          onSort={handleBuySort}
                        />
                        <SortableHeader
                          label="Amount / Shares"
                          columnKey="amount"
                          sortState={buySortState}
                          onSort={handleBuySort}
                        />
                        <SortableHeader
                          label="Price / share"
                          columnKey="pricePerShare"
                          sortState={buySortState}
                          onSort={handleBuySort}
                        />
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedBuys.map((row) => (
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
                  <div className="flex items-center justify-between mt-3">
                    <button onClick={props.onAdd} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                      <HiOutlinePlus size={15} /> Add a row
                    </button>
                  </div>
                  <Pagination
                    page={props.buyPage}
                    total={props.buyTotal}
                    pageSize={PAGE_SIZE}
                    onChange={props.onBuyPageChange}
                  />
                </div>
              )
            )}

            {props.activeTab === TabType.SELLS && (
              !props.hasAnySells && !isFiltered ? (
                <EmptyTable onAdd={props.onAdd} label="sells" />
              ) : props.sells.length === 0 ? (
                <EmptyTable onAdd={props.onAdd} label="sells" filtered={!!props.selectedCompany} dateFiltered={!props.selectedCompany && (!!props.dateFrom || !!props.dateTo)} selectedCompany={props.selectedCompany} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-widest">
                        <SortableHeader
                          label="Date"
                          columnKey="date"
                          sortState={sellSortState}
                          onSort={handleSellSort}
                        />
                        <SortableHeader
                          label="Company"
                          columnKey="company"
                          sortState={sellSortState}
                          onSort={handleSellSort}
                        />
                        <SortableHeader
                          label="Amount / Shares"
                          columnKey="amount"
                          sortState={sellSortState}
                          onSort={handleSellSort}
                        />
                        <SortableHeader
                          label="Capital gain"
                          columnKey="gain"
                          sortState={sellSortState}
                          onSort={handleSellSort}
                        />
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedSells.map((row) => (
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
                  <div className="flex items-center justify-between mt-3">
                    <button onClick={props.onAdd} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                      <HiOutlinePlus size={15} /> Add a row
                    </button>
                  </div>
                  <Pagination
                    page={props.sellPage}
                    total={props.sellTotal}
                    pageSize={PAGE_SIZE}
                    onChange={props.onSellPageChange}
                  />
                </div>
              )
            )}

            {props.activeTab === TabType.DIVIDENDS && (
              !props.hasAnyDividends && !isFiltered ? (
                <EmptyTable onAdd={props.onAdd} label="dividends" />
              ) : props.dividends.length === 0 ? (
                <EmptyTable onAdd={props.onAdd} label="dividends" dateFiltered={!!props.dateFrom || !!props.dateTo} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-widest">
                        <SortableHeader
                          label="Date"
                          columnKey="date"
                          sortState={dividendSortState}
                          onSort={handleDividendSort}
                        />
                        <SortableHeader
                          label="Amount"
                          columnKey="amount"
                          sortState={dividendSortState}
                          onSort={handleDividendSort}
                        />
                        <SortableHeader
                          label="Currency"
                          columnKey="currency"
                          sortState={dividendSortState}
                          onSort={handleDividendSort}
                        />
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedDividends.map((row) => (
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
                  <div className="flex items-center justify-between mt-3">
                    <button onClick={props.onAdd} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                      <HiOutlinePlus size={15} /> Add a row
                    </button>
                  </div>
                  <Pagination
                    page={props.dividendPage}
                    total={props.dividendTotal}
                    pageSize={PAGE_SIZE}
                    onChange={props.onDividendPageChange}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionTable;
