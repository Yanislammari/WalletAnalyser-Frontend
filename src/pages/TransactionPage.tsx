import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import PortfolioService from "../services/PortfolioService";
import CurrencyService from "../services/CurrencyService";
import type { Portfolio } from "../models/Portfolio";
import type { Currency } from "../models/Currency";
import type { AssetBuyResponse } from "../models/transactions/AssetBuyResponse";
import type { AssetSellResponse } from "../models/transactions/AssetSellResponse";
import type { AssetDividendResponse } from "../models/transactions/AssetDividendResponse";

// ── Types ─────────────────────────────────────────────────────────────────────

type TabType = "buys" | "sells" | "dividends";
type InputMode = "amount" | "shares";

interface BuyForm {
  date: string;
  company: string;
  inputMode: InputMode;
  amount: string;
  currencyId: string;
  shares: string;
  pricePerShare: string;
}

interface SellForm {
  date: string;
  company: string;
  inputMode: InputMode;
  amount: string;
  currencyId: string;
  shares: string;
  capitalGain: string;
  gainCurrencyId: string;
}

interface DividendForm {
  date: string;
  amount: string;
  currencyId: string;
}

const emptyBuy = (): BuyForm => ({ date: "", company: "", inputMode: "amount", amount: "", currencyId: "", shares: "", pricePerShare: "" });
const emptySell = (): SellForm => ({ date: "", company: "", inputMode: "amount", amount: "", currencyId: "", shares: "", capitalGain: "", gainCurrencyId: "" });
const emptyDividend = (): DividendForm => ({ date: "", amount: "", currencyId: "" });

// ── Helpers ───────────────────────────────────────────────────────────────────

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "buys",      label: "Buys",      icon: <HiOutlineArrowTrendingUp size={15} /> },
  { key: "sells",     label: "Sells",     icon: <HiOutlineArrowTrendingDown size={15} /> },
  { key: "dividends", label: "Dividends", icon: <HiOutlineBanknotes size={15} /> },
];

const tabAccent: Record<TabType, { badge: string; btn: string; icon: string; dot: string }> = {
  buys:      { badge: "text-emerald-600 bg-emerald-50", btn: "bg-emerald-600 hover:bg-emerald-700", icon: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-400" },
  sells:     { badge: "text-red-500 bg-red-50",         btn: "bg-red-500 hover:bg-red-600",         icon: "bg-red-100 text-red-500",         dot: "bg-red-400"     },
  dividends: { badge: "text-indigo-600 bg-indigo-50",   btn: "bg-indigo-600 hover:bg-indigo-700",   icon: "bg-indigo-100 text-indigo-600",   dot: "bg-indigo-400"  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const EmptyTable: React.FC<{ onAdd: () => void; label: string }> = ({ onAdd, label }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
      <HiOutlinePlus className="w-5 h-5 text-gray-400" />
    </div>
    <div className="text-center">
      <p className="text-gray-600 font-medium text-sm">No {label} yet</p>
      <p className="text-gray-400 text-xs mt-0.5">Click + to add a row</p>
    </div>
    <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl font-medium transition-colors cursor-pointer">
      <HiOutlinePlus size={15} /> Add
    </button>
  </div>
);

const InputModeToggle: React.FC<{ value: InputMode; onChange: (v: InputMode) => void }> = ({ value, onChange }) => (
  <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
    {(["amount", "shares"] as InputMode[]).map((m) => (
      <button key={m} type="button" onClick={() => onChange(m)}
        className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${value === m ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
        {m === "amount" ? "Amount" : "Shares"}
      </button>
    ))}
  </div>
);

const inputCls = "w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

// ── Main component ─────────────────────────────────────────────────────────────

const TransactionPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const portfolioService = PortfolioService.getInstance();
  const currencyService = CurrencyService.getInstance();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("buys");
  const [loading, setLoading] = useState(true);

  const [buys, setBuys] = useState<AssetBuyResponse[]>([]);
  const [sells, setSells] = useState<AssetSellResponse[]>([]);
  const [dividends, setDividends] = useState<AssetDividendResponse[]>([]);

  const [buyForm, setBuyForm] = useState<BuyForm>(emptyBuy());
  const [sellForm, setSellForm] = useState<SellForm>(emptySell());
  const [dividendForm, setDividendForm] = useState<DividendForm>(emptyDividend());
  const [saving, setSaving] = useState(false);

  const buyDialogRef = useRef<HTMLDialogElement>(null);
  const sellDialogRef = useRef<HTMLDialogElement>(null);
  const dividendDialogRef = useRef<HTMLDialogElement>(null);

  // ── Currency helper ──────────────────────────────────────────────────────────

  const currencyName = (uuid: string) =>
    currencies.find((c) => c.uuid === uuid)?.currencyName ?? uuid;

  // ── Fetch on mount ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!portfolioId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, c, b, s, d] = await Promise.all([
          portfolioService.getPortfolioById(portfolioId),
          currencyService.getAll(),
          portfolioService.getBuysByPortfolioId(portfolioId),
          portfolioService.getSellsByPortfolioId(portfolioId),
          portfolioService.getDividendsByPortfolioId(portfolioId),
        ]);
        setPortfolio(p);
        setCurrencies(c);
        setBuys(b);
        setSells(s);
        setDividends(d);
      } catch {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [portfolioId]);

  // Default currency when currencies are loaded
  useEffect(() => {
    if (currencies.length === 0) return;
    const eur = currencies.find((c) => c.currencyName === "EUR")?.uuid ?? currencies[0].uuid;
    setBuyForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
    setSellForm((f) => ({ ...f, currencyId: f.currencyId || eur, gainCurrencyId: f.gainCurrencyId || eur }));
    setDividendForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
  }, [currencies]);

  // ── Open modals ───────────────────────────────────────────────────────────────

  const openModal = () => {
    if (activeTab === "buys")       { setBuyForm(emptyBuy());           buyDialogRef.current?.showModal(); }
    else if (activeTab === "sells") { setSellForm(emptySell());         sellDialogRef.current?.showModal(); }
    else                            { setDividendForm(emptyDividend()); dividendDialogRef.current?.showModal(); }
  };

  // ── Add handlers ──────────────────────────────────────────────────────────────

  const handleAddBuy = async () => {
    if (!buyForm.date || !portfolioId || !buyForm.currencyId) return;
    setSaving(true);
    try {
      const created = await portfolioService.addAssetBuy({
        portfolioId,
        companyName: buyForm.company || undefined,
        buyCurrencyId: buyForm.currencyId,
        buyDate: buyForm.date,
        assetBuyAmount: buyForm.amount ? parseFloat(buyForm.amount) : undefined,
        assetBuyShare: buyForm.shares ? parseFloat(buyForm.shares) : undefined,
        assetBuyPricePerShare: buyForm.pricePerShare ? parseFloat(buyForm.pricePerShare) : undefined,
      });
      setBuys((prev) => [...prev, created]);
      buyDialogRef.current?.close();
      toast.success("Buy added.");
    } catch {
      toast.error("Failed to add entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSell = async () => {
    if (!sellForm.date || !portfolioId || !sellForm.currencyId) return;
    setSaving(true);
    try {
      const created = await portfolioService.addAssetSell({
        portfolioId,
        companyName: sellForm.company || undefined,
        sellCurrencyId: sellForm.currencyId,
        sellDate: sellForm.date,
        assetSellAmount: sellForm.amount ? parseFloat(sellForm.amount) : undefined,
        assetSellShare: sellForm.shares ? parseFloat(sellForm.shares) : undefined,
        assetSellGain: sellForm.capitalGain ? parseFloat(sellForm.capitalGain) : undefined,
      });
      setSells((prev) => [...prev, created]);
      sellDialogRef.current?.close();
      toast.success("Sell added.");
    } catch {
      toast.error("Failed to add entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDividend = async () => {
    if (!dividendForm.date || !portfolioId || !dividendForm.amount || !dividendForm.currencyId) return;
    setSaving(true);
    try {
      const created = await portfolioService.addAssetDividend({
        portfolioId,
        currencyId: dividendForm.currencyId,
        cashflowDate: dividendForm.date,
        cashflowAmount: parseFloat(dividendForm.amount),
      });
      setDividends((prev) => [...prev, created]);
      dividendDialogRef.current?.close();
      toast.success("Dividend added.");
    } catch {
      toast.error("Failed to add entry.");
    } finally {
      setSaving(false);
    }
  };

  // ── Currency select ────────────────────────────────────────────────────────────

  const CurrencySelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition">
      <option value="">Currency</option>
      {currencies.map((c) => (
        <option key={c.uuid} value={c.uuid}>{c.currencyName}</option>
      ))}
    </select>
  );

  // ── Count badges ───────────────────────────────────────────────────────────────

  const count = (tab: TabType) => tab === "buys" ? buys.length : tab === "sells" ? sells.length : dividends.length;

  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0">
            <HiOutlineArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">{portfolio?.name ?? "…"}</h2>
            <p className="text-gray-500 text-sm mt-0.5">Enter your transactions manually.</p>
          </div>
        </div>
        <button onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer font-medium shadow-sm shadow-purple-200 shrink-0">
          <HiOutlinePlus size={15} /> Add a row
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-4 gap-1">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-xl transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-gray-50 text-gray-900 border border-b-0 border-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}>
              <span className={activeTab === tab.key ? tabAccent[tab.key].badge.split(" ")[0] : ""}>{tab.icon}</span>
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
          {loading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-md text-purple-500" /></div>
          ) : (
            <>
              {/* BUYS */}
              {activeTab === "buys" && (
                buys.length === 0 ? <EmptyTable onAdd={openModal} label="achat" /> : (
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
                        {buys.map((row) => (
                          <tr key={row.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 text-gray-700">{row.buyDate}</td>
                            <td className="py-3 pr-4 text-gray-900 font-medium">{row.companyName ?? "—"}</td>
                            <td className="py-3 pr-4 text-gray-700">
                              {row.assetBuyAmount != null
                                ? `${row.assetBuyAmount}`
                                : row.assetBuyShare != null ? `${row.assetBuyShare} shares` : "—"}
                            </td>
                            <td className="py-3 pr-4 text-gray-700">
                              {row.assetBuyPricePerShare != null ? `${row.assetBuyPricePerShare}` : "—"}
                            </td>
                            <td className="py-3 text-right">
                              <button onClick={() => setBuys((p) => p.filter((r) => r.id !== row.id))}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                                <HiOutlineTrash size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={openModal} className="mt-3 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                      <HiOutlinePlus size={15} /> Add a row
                    </button>
                  </div>
                )
              )}

              {/* SELLS */}
              {activeTab === "sells" && (
                sells.length === 0 ? <EmptyTable onAdd={openModal} label="vente" /> : (
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
                        {sells.map((row) => (
                          <tr key={row.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 text-gray-700">{row.sellDate}</td>
                            <td className="py-3 pr-4 text-gray-900 font-medium">{row.companyName ?? "—"}</td>
                            <td className="py-3 pr-4 text-gray-700">
                              {row.assetSellAmount != null
                                ? `${row.assetSellAmount} ${currencyName(row.sellCurrencyId)}`
                                : row.assetSellShare != null ? `${row.assetSellShare} shares` : "—"}
                            </td>
                            <td className="py-3 pr-4">
                              {row.assetSellGain != null ? (
                                <span className={row.assetSellGain >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                                  {row.assetSellGain >= 0 ? "+" : ""}{row.assetSellGain} {currencyName(row.sellCurrencyId)}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="py-3 text-right">
                              <button onClick={() => setSells((p) => p.filter((r) => r.id !== row.id))}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                                <HiOutlineTrash size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={openModal} className="mt-3 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                      <HiOutlinePlus size={15} /> Add a row
                    </button>
                  </div>
                )
              )}

              {/* DIVIDENDS */}
              {activeTab === "dividends" && (
                dividends.length === 0 ? <EmptyTable onAdd={openModal} label="dividende" /> : (
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
                        {dividends.map((row) => (
                          <tr key={row.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 text-gray-700">{row.cashflowDate}</td>
                            <td className="py-3 pr-4 text-indigo-600 font-medium">{row.cashflowAmount}</td>
                            <td className="py-3 pr-4 text-gray-700">{currencyName(row.currencyId)}</td>
                            <td className="py-3 text-right">
                              <button onClick={() => setDividends((p) => p.filter((r) => r.id !== row.id))}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                                <HiOutlineTrash size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={openModal} className="mt-3 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                      <HiOutlinePlus size={15} /> Add a row
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modal Achat ──────────────────────────────────────────────────────────── */}
      <dialog ref={buyDialogRef} className="modal">
        <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${tabAccent.buys.icon} flex items-center justify-center`}>
                <HiOutlineArrowTrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">New buy</h3>
            </div>
            <button onClick={() => buyDialogRef.current?.close()} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"><HiOutlineXMark size={20} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={buyForm.date} onChange={(e) => setBuyForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input type="text" value={buyForm.company} onChange={(e) => setBuyForm((f) => ({ ...f, company: e.target.value }))} placeholder="e.g. Apple Inc." className={inputCls} />
            </div>
            <div>
              <label className={`${labelCls} mb-1.5`}>Enter by</label>
              <InputModeToggle value={buyForm.inputMode} onChange={(v) => setBuyForm((f) => ({ ...f, inputMode: v }))} />
            </div>
            {buyForm.inputMode === "amount" ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelCls}>Amount</label>
                  <input type="number" min={0} value={buyForm.amount} onChange={(e) => setBuyForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className={inputCls} />
                </div>
                <div className="w-32">
                  <label className={labelCls}>Currency</label>
                  <CurrencySelect value={buyForm.currencyId} onChange={(v) => setBuyForm((f) => ({ ...f, currencyId: v }))} />
                </div>
              </div>
            ) : (
              <div>
                <label className={labelCls}>Number of shares</label>
                <input type="number" min={0} value={buyForm.shares} onChange={(e) => setBuyForm((f) => ({ ...f, shares: e.target.value }))} placeholder="0" className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>Price per share</label>
              <input type="number" min={0} value={buyForm.pricePerShare} onChange={(e) => setBuyForm((f) => ({ ...f, pricePerShare: e.target.value }))} placeholder="0.00" className={inputCls} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => buyDialogRef.current?.close()} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddBuy} disabled={!buyForm.date || !buyForm.currencyId || saving}
                className={`flex-1 py-2.5 text-sm text-white ${tabAccent.buys.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}>
                {saving ? <span className="loading loading-spinner loading-xs text-white" /> : "Add"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* ── Modal Vente ───────────────────────────────────────────────────────────── */}
      <dialog ref={sellDialogRef} className="modal">
        <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${tabAccent.sells.icon} flex items-center justify-center`}>
                <HiOutlineArrowTrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">New sell</h3>
            </div>
            <button onClick={() => sellDialogRef.current?.close()} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"><HiOutlineXMark size={20} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={sellForm.date} onChange={(e) => setSellForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input type="text" value={sellForm.company} onChange={(e) => setSellForm((f) => ({ ...f, company: e.target.value }))} placeholder="e.g. Apple Inc." className={inputCls} />
            </div>
            <div>
              <label className={`${labelCls} mb-1.5`}>Enter by</label>
              <InputModeToggle value={sellForm.inputMode} onChange={(v) => setSellForm((f) => ({ ...f, inputMode: v }))} />
            </div>
            {sellForm.inputMode === "amount" ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelCls}>Amount</label>
                  <input type="number" min={0} value={sellForm.amount} onChange={(e) => setSellForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className={inputCls} />
                </div>
                <div className="w-32">
                  <label className={labelCls}>Currency</label>
                  <CurrencySelect value={sellForm.currencyId} onChange={(v) => setSellForm((f) => ({ ...f, currencyId: v }))} />
                </div>
              </div>
            ) : (
              <div>
                <label className={labelCls}>Number of shares</label>
                <input type="number" min={0} value={sellForm.shares} onChange={(e) => setSellForm((f) => ({ ...f, shares: e.target.value }))} placeholder="0" className={inputCls} />
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelCls}>Capital gain</label>
                <input type="number" value={sellForm.capitalGain} onChange={(e) => setSellForm((f) => ({ ...f, capitalGain: e.target.value }))} placeholder="0.00" className={inputCls} />
              </div>
              <div className="w-32">
                <label className={labelCls}>Devise</label>
                <CurrencySelect value={sellForm.gainCurrencyId} onChange={(v) => setSellForm((f) => ({ ...f, gainCurrencyId: v }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => sellDialogRef.current?.close()} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddSell} disabled={!sellForm.date || !sellForm.currencyId || saving}
                className={`flex-1 py-2.5 text-sm text-white ${tabAccent.sells.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}>
                {saving ? <span className="loading loading-spinner loading-xs text-white" /> : "Add"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* ── Modal Dividende ───────────────────────────────────────────────────────── */}
      <dialog ref={dividendDialogRef} className="modal">
        <div className="modal-box bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${tabAccent.dividends.icon} flex items-center justify-center`}>
                <HiOutlineBanknotes className="w-5 h-5" />
              </div>
              <h3 className="text-gray-900 font-bold text-base">New dividend</h3>
            </div>
            <button onClick={() => dividendDialogRef.current?.close()} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"><HiOutlineXMark size={20} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={dividendForm.date} onChange={(e) => setDividendForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelCls}>Montant</label>
                <input type="number" min={0} value={dividendForm.amount} onChange={(e) => setDividendForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className={inputCls} />
              </div>
              <div className="w-32">
                <label className={labelCls}>Devise</label>
                <CurrencySelect value={dividendForm.currencyId} onChange={(v) => setDividendForm((f) => ({ ...f, currencyId: v }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => dividendDialogRef.current?.close()} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddDividend} disabled={!dividendForm.date || !dividendForm.amount || !dividendForm.currencyId || saving}
                className={`flex-1 py-2.5 text-sm text-white ${tabAccent.dividends.btn} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors cursor-pointer`}>
                {saving ? <span className="loading loading-spinner loading-xs text-white" /> : "Add"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  );
};

export default TransactionPage;
