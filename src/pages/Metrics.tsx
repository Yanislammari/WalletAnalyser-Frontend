import React, { useState, useEffect } from "react";
import {
  HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
  HiOutlineChartBar, HiOutlineBanknotes, HiOutlineClock,
  HiOutlineScale, HiOutlineSparkles, HiOutlineInformationCircle,
} from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import CurrencyService from "../services/CurrencyService";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import type { MetricResponse, MonthlyDataPoint } from "../responses/MetricResponse";
import type { Currency } from "../models/Currency";

const portfolioService = PortfolioService.getInstance();
const currencyService  = CurrencyService.getInstance();

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const fmt = (v: number, currency: string, decimals = 2) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: decimals }).format(v);

const fmtPct = (v: number, decimals = 2) =>
  `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;

const positive = (v: number) => v >= 0;

// ─── Mini bar chart using SVG ─────────────────────────────────────────────────

const GainChart: React.FC<{ data: MonthlyDataPoint[]; currency: string }> = ({ data, currency }) => {
  if (data.length === 0) return null;

  const visible = data.slice(-24); // last 24 months
  const gains = visible.map(d => d.netGain);
  const max = Math.max(...gains.map(Math.abs), 1);
  const W = 100, H = 60, barW = Math.max(2, (W / visible.length) - 1);

  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
        {/* Zero line */}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" />
        {visible.map((d, i) => {
          const isPositive = d.netGain >= 0;
          const pct = Math.abs(d.netGain) / max;
          const barH = pct * (H / 2 - 2);
          const x = i * (W / visible.length);
          const y = isPositive ? H / 2 - barH : H / 2;
          return (
            <rect
              key={d.month}
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, 0.5)}
              fill={isPositive ? "#8b5cf6" : "#f43f5e"}
              opacity={0.8}
              rx={0.5}
            >
              <title>{d.month}: {fmt(d.netGain, currency)}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{visible[0]?.month}</span>
        <span>{visible[visible.length - 1]?.month}</span>
      </div>
    </div>
  );
};

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  positive?: boolean;
  neutral?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtitle, description, icon, positive: isPositive, neutral }) => {
  const [showInfo, setShowInfo] = useState(false);
  const color = neutral ? "text-gray-800" : isPositive ? "text-emerald-600" : "text-rose-500";
  const bg    = neutral ? "bg-gray-50" : isPositive ? "bg-emerald-50" : "bg-rose-50";
  const iconColor = neutral ? "text-gray-500" : isPositive ? "text-emerald-500" : "text-rose-500";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <button
          onClick={() => setShowInfo(v => !v)}
          className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
        >
          <HiOutlineInformationCircle size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {showInfo && (
        <div className="absolute bottom-full left-0 mb-2 z-10 bg-gray-900 text-white text-xs rounded-xl p-3 w-56 shadow-lg">
          {description}
        </div>
      )}
    </div>
  );
};

// ─── Allocation bar ───────────────────────────────────────────────────────────

const PALETTE = ["#8b5cf6", "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

// ─── Main page ────────────────────────────────────────────────────────────────

const Metrics: React.FC = () => {
  const { user } = useAuth();
  const { selectedPortfolioId } = useSelectedPortfolio();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>("");
  const [metrics, setMetrics] = useState<MetricResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    currencyService.getAll().then((c) => {
      setCurrencies(c);
      const eur = c.find(x => x.currencyName === "EUR");
      if (eur) setSelectedCurrencyId(eur.uuid);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedPortfolioId || !selectedCurrencyId) return;
    setLoading(true);
    setError(null);
    portfolioService.getMetrics(selectedPortfolioId)
      .then(setMetrics)
      .catch(() => setError("Failed to load metrics"))
      .finally(() => setLoading(false));
  }, [selectedPortfolioId, selectedCurrencyId]);

  const cy = metrics?.currencyName ?? "EUR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-xl font-bold tracking-tight">Performance Metrics</h2>
          <p className="text-gray-500 text-sm mt-0.5">In-depth analysis of your portfolio's performance.</p>
        </div>
        <select
          value={selectedCurrencyId}
          onChange={e => setSelectedCurrencyId(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
        >
          {currencies.map(c => <option key={c.uuid} value={c.uuid}>{c.currencyName}</option>)}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-md text-purple-600" />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm">{error}</div>
      )}

      {metrics && !loading && (
        <>
          {/* Summary strip */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Total Invested</p>
                <p className="text-xl font-bold">{fmt(metrics.totalInvested, cy)}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Total Returned</p>
                <p className="text-xl font-bold">{fmt(metrics.totalReturned, cy)}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Net Gain</p>
                <p className={`text-xl font-bold ${positive(metrics.gain) ? "text-emerald-300" : "text-rose-300"}`}>
                  {metrics.gain >= 0 ? "+" : ""}{fmt(metrics.gain, cy)}
                </p>
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Period</p>
                <p className="text-xl font-bold">{metrics.periodYears} yrs</p>
                <p className="text-purple-300 text-xs">{metrics.firstBuyDate ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              label="Gain"
              value={fmtPct(metrics.gainPercent)}
              subtitle={`${metrics.gain >= 0 ? "+" : ""}${fmt(metrics.gain, cy)}`}
              description="Total return as a percentage of total invested capital (sells + dividends vs. cost of buys)."
              icon={positive(metrics.gainPercent) ? <HiOutlineArrowTrendingUp size={18} /> : <HiOutlineArrowTrendingDown size={18} />}
              positive={positive(metrics.gainPercent)}
            />
            <MetricCard
              label="CAGR"
              value={fmtPct(metrics.cagr)}
              subtitle="per year"
              description="Compound Annual Growth Rate — the annualized return assuming reinvestment. Requires at least 1 year of history."
              icon={<HiOutlineChartBar size={18} />}
              positive={positive(metrics.cagr)}
            />
            <MetricCard
              label="Volatility"
              value={`${metrics.volatility.toFixed(1)}%`}
              subtitle="annualized (monthly std dev)"
              description="Annualized standard deviation of monthly returns. Lower is less risky. Computed from all buy/sell/dividend cash flows."
              icon={<HiOutlineScale size={18} />}
              neutral
            />
            <MetricCard
              label="Sharpe Ratio"
              value={metrics.sharpeRatio.toFixed(2)}
              subtitle="risk-adjusted return (rf = 4%)"
              description="(CAGR − 4% risk-free rate) ÷ volatility. Above 1 is good, above 2 is excellent. Negative means the risk isn't compensated."
              icon={<HiOutlineSparkles size={18} />}
              positive={metrics.sharpeRatio >= 1}
              neutral={metrics.sharpeRatio > 0 && metrics.sharpeRatio < 1}
            />
            <MetricCard
              label="Dividend Income"
              value={fmt(metrics.totalDividends, cy)}
              subtitle={`Yield: ${metrics.dividendYield.toFixed(2)}%`}
              description="Total dividends received, expressed in your target currency. Dividend yield = dividends ÷ total invested."
              icon={<HiOutlineBanknotes size={18} />}
              positive={metrics.totalDividends > 0}
              neutral={metrics.totalDividends === 0}
            />
            <MetricCard
              label="Holding Period"
              value={`${metrics.periodYears} years`}
              subtitle={metrics.firstBuyDate ? `Since ${metrics.firstBuyDate}` : "No buys yet"}
              description="Time elapsed since your first buy. CAGR and Sharpe ratio become more meaningful over longer periods."
              icon={<HiOutlineClock size={18} />}
              neutral
            />
          </div>

          {/* Gain over time chart */}
          {metrics.monthlyData.length > 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Cumulative net gain over time</p>
              <p className="text-xs text-gray-400 mb-2">Bars above zero = profit · below zero = loss · last 24 months</p>
              <GainChart data={metrics.monthlyData} currency={cy} />
            </div>
          )}

          {/* Top holdings */}
          {metrics.topHoldings.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-4">Top holdings</p>
              <div className="space-y-3">
                {metrics.topHoldings.map((h, i) => (
                  <div key={h.companyName}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                        />
                        <span className="text-sm font-medium text-gray-800 truncate">{h.companyName}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-gray-500">{fmt(h.invested, cy, 0)}</span>
                        <span className="text-xs text-gray-400 w-10 text-right">{h.allocation.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(h.allocation, 100)}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Methodology note */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <HiOutlineInformationCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-amber-700 leading-relaxed">
              Metrics are computed from cash flows (buys, sells, dividends) converted to {cy}. They do not reflect the current
              unrealized market value of open positions. Volatility and Sharpe ratio use monthly aggregated data and may
              underestimate true risk for portfolios with few transactions.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Metrics;
