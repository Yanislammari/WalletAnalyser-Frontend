import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, type NavigateFunction } from "react-router";
import { toast } from "sonner";
import { HiOutlineArrowLeft, HiOutlinePlus } from "react-icons/hi2";
import PortfolioService from "../services/PortfolioService";
import CurrencyService from "../services/CurrencyService";
import type { Portfolio } from "../models/Portfolio";
import type { Currency } from "../models/Currency";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import TransactionTable from "../components/TransactionTable";
import AddNewBuyModal from "../components/AddNewBuyModal";
import AddNewSellModal from "../components/AddNewSellModal";
import AddNewDividendModal from "../components/AddNewDividendModal";
import { TabType } from "../enums/TabType";

const TransactionPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate: NavigateFunction = useNavigate();
  const portfolioService = PortfolioService.getInstance();
  const currencyService = CurrencyService.getInstance();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.BUYS);
  const [loading, setLoading] = useState<boolean>(true);
  const [buys, setBuys] = useState<AssetBuyResponse[]>([]);
  const [sells, setSells] = useState<AssetSellResponse[]>([]);
  const [dividends, setDividends] = useState<AssetDividendResponse[]>([]);
  const buyDialogRef = useRef<HTMLDialogElement>(null);
  const sellDialogRef = useRef<HTMLDialogElement>(null);
  const dividendDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!portfolioId) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [portfolio, currencies, buys, sells, dividends] = await Promise.all([
          portfolioService.getPortfolioById(portfolioId),
          currencyService.getAll(),
          portfolioService.getBuysByPortfolioId(portfolioId),
          portfolioService.getSellsByPortfolioId(portfolioId),
          portfolioService.getDividendsByPortfolioId(portfolioId),
        ]);

        setPortfolio(portfolio);
        setCurrencies(currencies);
        setBuys(buys);
        setSells(sells);
        setDividends(dividends);
      }
      catch {
        toast.error("Failed to load data.");
      }
      finally {
        setLoading(false);
      }
    };
    
    load();
  }, [portfolioId]);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
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
      <TransactionTable
        activeTab={activeTab}
        onTabChange={setActiveTab}
        buys={buys}
        sells={sells}
        dividends={dividends}
        loading={loading}
        onAdd={openModal}
        onDeleteBuy={(id) => setBuys((prev) => prev.filter((r) => r.id !== id))}
        onDeleteSell={(id) => setSells((prev) => prev.filter((r) => r.id !== id))}
        onDeleteDividend={(id) => setDividends((prev) => prev.filter((r) => r.id !== id))}
        currencyName={(uuid) => currencies.find((c) => c.uuid === uuid)?.currencyName ?? uuid}
      />
      {portfolioId && (
        <div>
          <AddNewBuyModal
            dialogRef={buyDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={(buy) => setBuys((prev) => [...prev, buy])}
          />
          <AddNewSellModal
            dialogRef={sellDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={(sell) => setSells((prev) => [...prev, sell])}
          />
          <AddNewDividendModal
            dialogRef={dividendDialogRef}
            currencies={currencies}
            portfolioId={portfolioId}
            onSuccess={(dividend) => setDividends((prev) => [...prev, dividend])}
          />
        </div>
      )}
    </div>
  );
}

export default TransactionPage;
