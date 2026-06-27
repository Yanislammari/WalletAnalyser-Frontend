import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, type NavigateFunction } from "react-router";
import { toast } from "sonner";
import { HiOutlineArrowLeft, HiOutlinePlus } from "react-icons/hi2";
import PortfolioNotFound from "./PortfolioNotFound";
import PortfolioService from "../services/PortfolioService";
import CurrencyService from "../services/CurrencyService";
import type { Portfolio } from "../models/Portfolio";
import type { Currency } from "../models/Currency";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import type { PortfolioTotalResponse } from "../responses/PortfolioTotalResponse";
import TransactionTable from "../components/TransactionTable";
import AddNewBuyModal from "../components/AddNewBuyModal";
import AddNewSellModal from "../components/AddNewSellModal";
import AddNewDividendModal from "../components/AddNewDividendModal";
import { TabType } from "../enums/TabType";

const PAGE_SIZE: number = 10;

const Transactions: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate: NavigateFunction = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioService = PortfolioService.getInstance();
  const currencyService = CurrencyService.getInstance();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buys, setBuys] = useState<AssetBuyResponse[]>([]);
  const [sells, setSells] = useState<AssetSellResponse[]>([]);
  const [dividends, setDividends] = useState<AssetDividendResponse[]>([]);
  const [buyTotal, setBuyTotal] = useState<number>(0);
  const [sellTotal, setSellTotal] = useState<number>(0);
  const [dividendTotal, setDividendTotal] = useState<number>(0);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(() => searchParams.get("company") || null);
  const [dateFrom, setDateFrom] = useState<string>(() => searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState<string>(() => searchParams.get("to") ?? "");
  const [hasAnyBuys, setHasAnyBuys] = useState<boolean>(false);
  const [hasAnySells, setHasAnySells] = useState<boolean>(false);
  const [hasAnyDividends, setHasAnyDividends] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [portfolioTotal, setPortfolioTotal] = useState<PortfolioTotalResponse | null>(null);
  const [totalLoading, setTotalLoading] = useState<boolean>(false);
  const [portfolioNotFound, setPortfolioNotFound] = useState<boolean>(false);
  const buyDialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);
  const sellDialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);
  const dividendDialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);
  const editBuyDialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);
  const editSellDialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);
  const editDividendDialogRef: React.RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);
  const [editingBuy, setEditingBuy] = useState<AssetBuyResponse | null>(null);
  const [editingSell, setEditingSell] = useState<AssetSellResponse | null>(null);
  const [editingDividend, setEditingDividend] = useState<AssetDividendResponse | null>(null);

  const parseTab = (raw: string | null): TabType => {
    const upper: string | undefined = raw?.toUpperCase();
    if (upper === TabType.SELLS || upper === TabType.DIVIDENDS) {
      return upper as TabType;
    }

    return TabType.BUYS;
  };

  const [activeTab, setActiveTab] = useState<TabType>(() => parseTab(searchParams.get("tab")));

  const parsePage = (raw: string | null): number => {
    const n = parseInt(raw ?? "1");
    return isNaN(n) || n < 1 ? 1 : n;
  };

  const [buyPage, setBuyPage] = useState<number>(() => parsePage(searchParams.get("buyPage")));
  const [sellPage, setSellPage] = useState<number>(() => parsePage(searchParams.get("sellPage")));
  const [dividendPage, setDividendPage] = useState<number>(() => parsePage(searchParams.get("dividendPage")));

  useEffect(() => {
    const params: Record<string, string> = {};
    params.tab = activeTab.toLowerCase();

    if (buyPage !== 1) {
      params.buyPage = String(buyPage);
    }
    if (sellPage !== 1) {
      params.sellPage = String(sellPage);
    }
    if (dividendPage !== 1) {
      params.dividendPage = String(dividendPage);
    }
    if (dateFrom) {
      params.from = dateFrom;
    }
    if (dateTo) {
      params.to = dateTo;
    }
    if (selectedCompany) {
      params.company = selectedCompany;
    }

    setSearchParams(params, { replace: true });
  }, [activeTab, buyPage, sellPage, dividendPage, dateFrom, dateTo, selectedCompany]);

  useEffect(() => {
    if (!portfolioId) {
      return;
    }

    const loadStatic = async () => {
      try {
        const [fetchedPortfolio, fetchedCurrencies, fetchedCompanies] = await Promise.all([
          portfolioService.getPortfolioById(portfolioId),
          currencyService.getAll(),
          portfolioService.getCompaniesByPortfolioId(portfolioId),
        ]);

        setPortfolio(fetchedPortfolio);
        setCurrencies(fetchedCurrencies);
        setCompanies(fetchedCompanies);
      }
      catch {
        // Any failure loading the portfolio (404, malformed ID, 500) → show not-found state.
        // There is no point displaying an empty transactions page without a valid portfolio.
        setPortfolioNotFound(true);
      }
    };

    loadStatic();
  }, [portfolioId]);

  // Load portfolio total whenever portfolioId or transactions change
  useEffect(() => {
    if (!portfolioId) return;

    const loadTotal = async () => {
      setTotalLoading(true);
      try {
        const total = await portfolioService.getPortfolioTotal(portfolioId);
        setPortfolioTotal(total);
      }
      catch {
        // silently fail — total is non-critical
      }
      finally {
        setTotalLoading(false);
      }
    };

    loadTotal();
  }, [portfolioId, reloadTrigger]);

  useEffect(() => {
    if (!portfolioId) {
      return;
    }

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const [buyResult, sellResult, dividendResult] = await Promise.all([
          portfolioService.getBuysByPortfolioId(portfolioId, buyPage, PAGE_SIZE, dateFrom || undefined, dateTo || undefined, selectedCompany || undefined),
          portfolioService.getSellsByPortfolioId(portfolioId, sellPage, PAGE_SIZE, dateFrom || undefined, dateTo || undefined, selectedCompany || undefined),
          portfolioService.getDividendsByPortfolioId(portfolioId, dividendPage, PAGE_SIZE, dateFrom || undefined, dateTo || undefined, selectedCompany || undefined),
        ]);

        setBuys(buyResult.data);
        setBuyTotal(buyResult.total);
        setSells(sellResult.data);
        setSellTotal(sellResult.total);
        setDividends(dividendResult.data);
        setDividendTotal(dividendResult.total);

        if (!selectedCompany && !dateFrom && !dateTo) {
          setHasAnyBuys(buyResult.total > 0);
          setHasAnySells(sellResult.total > 0);
          setHasAnyDividends(dividendResult.total > 0);
        }
      }
      catch {
        // Only show a toast when the portfolio itself loaded fine — if the portfolio
        // was not found, loadStatic already set portfolioNotFound and the toast
        // would be confusing noise on top of the not-found UI.
        if (!portfolioNotFound) {
          toast.error("Failed to load transactions.");
        }
      }
      finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [portfolioId, buyPage, sellPage, dividendPage, selectedCompany, dateFrom, dateTo, reloadTrigger]);

  const handleCompanyChange = (company: string | null) => {
    setBuyPage(1);
    setSellPage(1);
    setDividendPage(1);
    setSelectedCompany(company);
  };

  const handleDateFromChange = (value: string) => {
    setBuyPage(1);
    setSellPage(1);
    setDividendPage(1);
    setDateFrom(value);
  };

  const handleDateToChange = (value: string) => {
    setBuyPage(1);
    setSellPage(1);
    setDividendPage(1);
    setDateTo(value);
  };

  const clampPageAfterDelete = (currentPage: number, currentTotal: number, setPage: (p: number) => void) => {
    const newTotal = currentTotal - 1;
    const maxPage = Math.max(Math.ceil(newTotal / PAGE_SIZE), 1);
    if (currentPage > maxPage) setPage(maxPage);
  };

  const handleDeleteBuy = async (id: string): Promise<void> => {
    await portfolioService.deleteAssetBuy(portfolioId!, id);
    clampPageAfterDelete(buyPage, buyTotal, setBuyPage);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleDeleteSell = async (id: string): Promise<void> => {
    await portfolioService.deleteAssetSell(portfolioId!, id);
    clampPageAfterDelete(sellPage, sellTotal, setSellPage);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleDeleteDividend = async (id: string): Promise<void> => {
    await portfolioService.deleteAssetDividend(portfolioId!, id);
    clampPageAfterDelete(dividendPage, dividendTotal, setDividendPage);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleEditBuy = (buy: AssetBuyResponse): void => {
    setEditingBuy(buy);
    setTimeout(() => editBuyDialogRef.current?.showModal(), 0);
  };

  const handleEditSell = (sell: AssetSellResponse): void => {
    setEditingSell(sell);
    setTimeout(() => editSellDialogRef.current?.showModal(), 0);
  };

  const handleEditDividend = (dividend: AssetDividendResponse): void => {
    setEditingDividend(dividend);
    setTimeout(() => editDividendDialogRef.current?.showModal(), 0);
  };

  const handleBuySuccess = (buy: AssetBuyResponse): void => {
    setHasAnyBuys(true);
    if (buy.companyName && !companies.includes(buy.companyName)) {
      setCompanies((prev) => [...prev, buy.companyName!].sort());
    }
  
    setReloadTrigger((prev) => prev + 1);
  };

  const handleSellSuccess = (sell: AssetSellResponse): void => {
    setHasAnySells(true);
    if (sell.companyName && !companies.includes(sell.companyName)) {
      setCompanies((prev) => [...prev, sell.companyName!].sort());
    }
    
    setReloadTrigger((prev) => prev + 1);
  };

  const handleDividendSuccess = (_dividend: AssetDividendResponse): void => {
    setHasAnyDividends(true);
    setReloadTrigger((prev) => prev + 1);
  };

  const openModal = () => {
    if (activeTab === TabType.BUYS) {
      buyDialogRef.current?.showModal();
    }
    else if (activeTab === TabType.SELLS) {
      sellDialogRef.current?.showModal();
    }
    else {
      dividendDialogRef.current?.showModal();
    }
  };

  if (portfolioNotFound) {
    return <PortfolioNotFound />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home/portfolio")}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <HiOutlineArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">{portfolio?.name ?? "…"}</h2>
            <p className="text-gray-500 text-sm mt-0.5">Enter your transactions manually.</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer font-medium shadow-sm shadow-purple-200 shrink-0"
        >
          <HiOutlinePlus size={15} /> Add a row
        </button>
      </div>
      {/* Portfolio Summary Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-gray-800 font-semibold text-sm">Portfolio Summary</h3>
          {portfolio?.displayCurrencyName && (
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              {portfolio.displayCurrencyName}
            </span>
          )}
        </div>
        {totalLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Invested</p>
              <p className="text-lg font-bold text-gray-900">
                {portfolioTotal
                  ? portfolioTotal.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—"}
                <span className="text-xs font-medium text-gray-400 ml-1">{portfolioTotal?.currencyName ?? ""}</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Sells</p>
              <p className="text-lg font-bold text-gray-900">
                {portfolioTotal
                  ? portfolioTotal.totalSells.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—"}
                <span className="text-xs font-medium text-gray-400 ml-1">{portfolioTotal?.currencyName ?? ""}</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Dividends</p>
              <p className="text-lg font-bold text-gray-900">
                {portfolioTotal
                  ? portfolioTotal.totalDividends.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—"}
                <span className="text-xs font-medium text-gray-400 ml-1">{portfolioTotal?.currencyName ?? ""}</span>
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Portfolio Value</p>
              <p className="text-lg font-bold text-blue-700">
                {portfolioTotal
                  ? portfolioTotal.portfolioMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—"}
                <span className="text-xs font-medium opacity-60 ml-1">{portfolioTotal?.currencyName ?? ""}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Value of held positions</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Total Value</p>
              <p className="text-lg font-bold text-purple-700">
                {portfolioTotal
                  ? portfolioTotal.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "—"}
                <span className="text-xs font-medium opacity-60 ml-1">{portfolioTotal?.currencyName ?? ""}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Portfolio value + Sells + Dividends</p>
            </div>
            <div className={`rounded-xl p-3 ${portfolioTotal && (portfolioTotal.totalValue - portfolioTotal.totalInvested) >= 0 ? "bg-green-50" : "bg-red-50"}`}>
              <p className="text-xs text-gray-500 mb-1">Total P&amp;L</p>
              <p className={`text-lg font-bold ${portfolioTotal && (portfolioTotal.totalValue - portfolioTotal.totalInvested) >= 0 ? "text-green-700" : "text-red-600"}`}>
                {portfolioTotal
                  ? (() => {
                      const pnl = portfolioTotal.totalValue - portfolioTotal.totalInvested;
                      return (pnl >= 0 ? "+" : "") + pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()
                  : "—"}
                <span className="text-xs font-medium opacity-60 ml-1">{portfolioTotal?.currencyName ?? ""}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Including unrealized gains</p>
            </div>
          </div>
        )}
      </div>
      <TransactionTable
        activeTab={activeTab}
        onTabChange={setActiveTab}
        buys={buys}
        sells={sells}
        dividends={dividends}
        buyTotal={buyTotal}
        sellTotal={sellTotal}
        dividendTotal={dividendTotal}
        buyPage={buyPage}
        sellPage={sellPage}
        dividendPage={dividendPage}
        onBuyPageChange={setBuyPage}
        onSellPageChange={setSellPage}
        onDividendPageChange={setDividendPage}
        loading={loading}
        onAdd={openModal}
        onDeleteBuy={handleDeleteBuy}
        onDeleteSell={handleDeleteSell}
        onDeleteDividend={handleDeleteDividend}
        onEditBuy={handleEditBuy}
        onEditSell={handleEditSell}
        onEditDividend={handleEditDividend}
        currencyName={(uuid) => currencies.find((c) => c.uuid === uuid)?.currencyName ?? uuid}
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={handleCompanyChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        hasAnyBuys={hasAnyBuys}
        hasAnySells={hasAnySells}
        hasAnyDividends={hasAnyDividends}
      />
      {portfolioId && (
        <div>
          <AddNewBuyModal
            dialogRef={buyDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={handleBuySuccess}
          />
          <AddNewSellModal
            dialogRef={sellDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            ownedCompanies={companies}
            onSuccess={handleSellSuccess}
          />
          <AddNewDividendModal
            dialogRef={dividendDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={handleDividendSuccess}
          />
          {/* Edit modals */}
          <AddNewBuyModal
            dialogRef={editBuyDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={() => setReloadTrigger((p) => p + 1)}
            editTransaction={editingBuy ?? undefined}
          />
          <AddNewSellModal
            dialogRef={editSellDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            ownedCompanies={companies}
            onSuccess={() => setReloadTrigger((p) => p + 1)}
            editTransaction={editingSell ?? undefined}
          />
          <AddNewDividendModal
            dialogRef={editDividendDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={() => setReloadTrigger((p) => p + 1)}
            editTransaction={editingDividend ?? undefined}
          />
        </div>
      )}
    </div>
  );
}

export default Transactions;
