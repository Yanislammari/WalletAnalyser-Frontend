import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
  HiOutlineChartBar, HiOutlineBanknotes, HiOutlineClock,
  HiOutlineScale, HiOutlineSparkles, HiOutlineInformationCircle, HiOutlineBriefcase,
  HiOutlineArrowPath, HiOutlineCalculator,
} from "react-icons/hi2";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import type { MetricResponse, MonthlyDataPoint } from "../responses/MetricResponse";

const portfolioService = PortfolioService.getInstance();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number, currency: string, decimals = 2) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: decimals }).format(v);

const fmtPct = (v: number, decimals = 1) =>
  `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;

const pos = (v: number) => v >= 0;

const formatPeriod = (fromDate: string): string => {
  const start     = new Date(fromDate);
  const now       = new Date();
  const totalDays = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  if (totalDays <= 0)  return "Today";
  if (totalDays < 7)   return `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
  if (totalDays < 30)  {
    const w = Math.floor(totalDays / 7);
    const d = totalDays % 7;
    return d > 0 ? `${w}w ${d}d` : `${w} week${w !== 1 ? "s" : ""}`;
  }
  if (totalDays < 365) {
    const m = Math.round(totalDays / 30.44);
    return `${m} month${m !== 1 ? "s" : ""}`;
  }
  const y   = Math.floor(totalDays / 365.25);
  const rem = totalDays - Math.floor(y * 365.25);
  const m   = Math.round(rem / 30.44);
  return m > 0 ? `${y}y ${m}m` : `${y} year${y !== 1 ? "s" : ""}`;
};

// ─── Period presets ───────────────────────────────────────────────────────────

type PeriodPreset = "ALL" | "5Y" | "3Y" | "2Y" | "1Y" | "6M" | "3M";
const PRESET_LABELS: Record<PeriodPreset, string> = {
  ALL: "All time", "5Y": "5 years", "3Y": "3 years", "2Y": "2 years",
  "1Y": "1 year", "6M": "6 months", "3M": "3 months",
};
const PRESET_MONTHS: Record<PeriodPreset, number | null> = {
  ALL: null, "5Y": 60, "3Y": 36, "2Y": 24, "1Y": 12, "6M": 6, "3M": 3,
};

/** Compute ISO date string (YYYY-MM-DD) for the start of a preset period, or undefined for ALL */
const presetToFromDate = (preset: PeriodPreset): string | undefined => {
  const months = PRESET_MONTHS[preset];
  if (months === null) return undefined;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split("T")[0];
};

// ─── Bar chart ────────────────────────────────────────────────────────────────

const GainChart: React.FC<{ data: MonthlyDataPoint[]; currency: string }> = ({ data, currency }) => {
  if (data.length < 2) return <p className="text-xs text-gray-300 text-center py-6">Not enough data</p>;

  const gains = data.map(d => d.netGain);
  const max   = Math.max(...gains.map(Math.abs), 1);
  const W = 100, H = 60, barW = Math.max(1.5, (W / data.length) - 0.5);

  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#e5e7eb" strokeWidth="0.5" />
        {data.map((d, i) => {
          const isPosBar = d.netGain >= 0;
          const pct  = Math.abs(d.netGain) / max;
          const barH = Math.max(pct * (H / 2 - 2), 0.5);
          const x    = i * (W / data.length);
          const y    = isPosBar ? H / 2 - barH : H / 2;
          return (
            <rect key={d.month} x={x} y={y} width={barW} height={barH}
              fill={isPosBar ? "#8b5cf6" : "#f43f5e"} opacity={0.8} rx={0.4}>
              <title>{d.month}: {fmt(d.netGain, currency)}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{data[0]?.month}</span>
        <span>{data[data.length - 1]?.month}</span>
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
  tag?: string;      // small badge e.g. "risk-adjusted"
}

const MetricCard: React.FC<MetricCardProps> = ({
  label, value, subtitle, description, icon,
  positive: isPositive, neutral, tag,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const color     = neutral ? "text-gray-800" : isPositive ? "text-emerald-600" : "text-rose-500";
  const bg        = neutral ? "bg-gray-50"    : isPositive ? "bg-emerald-50"    : "bg-rose-50";
  const iconColor = neutral ? "text-gray-500" : isPositive ? "text-emerald-500" : "text-rose-500";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          {tag && <span className="text-[9px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{tag}</span>}
          <button onClick={() => setShowInfo(v => !v)} className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <HiOutlineInformationCircle size={16} />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {showInfo && (
        <div className="absolute bottom-full left-0 mb-2 z-10 bg-gray-900 text-white text-xs rounded-xl p-3 w-60 shadow-lg leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
};

// ─── Drawdown chart ───────────────────────────────────────────────────────────

const DrawdownChart: React.FC<{ data: MonthlyDataPoint[] }> = ({ data }) => {
  if (data.length < 2) return null;

  // Build drawdown series: % below running peak
  const values = data.map(d => d.invested + d.netGain);
  let peak = -Infinity;
  const ddSeries = values.map(v => {
    if (v > peak) peak = v;
    return peak > 0 ? ((v - peak) / peak) * 100 : 0;
  });

  const minDD = Math.min(...ddSeries);
  const W = 600, H = 80;
  const PAD = { left: 40, right: 8, top: 8, bottom: 20 };
  const cW  = W - PAD.left - PAD.right;
  const cH  = H - PAD.top  - PAD.bottom;
  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * cW;
  const toY = (v: number) => PAD.top + ((0 - v) / (0 - minDD + 0.1)) * cH;

  const coords = ddSeries.map((v, i) => [toX(i), toY(v)] as [number, number]);
  const areaPath = [
    `M${coords[0][0]},${PAD.top}`,
    ...coords.map(([x, y]) => `L${x},${y}`),
    `L${coords[coords.length - 1][0]},${PAD.top}`,
    "Z",
  ].join(" ");

  // X labels
  const step = Math.max(1, Math.floor((data.length - 1) / 5));
  const xIdxs = new Set<number>([0, data.length - 1]);
  for (let i = step; i < data.length - 1; i += step) xIdxs.add(i);

  const fmtM = (key: string) => {
    const [y, m] = key.split("-");
    return `${["J","F","M","A","M","J","J","A","S","O","N","D"][Number(m)-1]}${y.slice(2)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ userSelect: "none" }}>
      <defs>
        <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Zero line */}
      <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top} y2={PAD.top} stroke="#e5e7eb" strokeWidth="1" />
      {/* Area */}
      <path d={areaPath} fill="url(#ddGrad)" />
      {/* Line */}
      <polyline
        points={coords.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Y label */}
      <text x={PAD.left - 4} y={PAD.top + cH / 2 + 4} fontSize="9" fill="#d1d5db" textAnchor="end" fontFamily="sans-serif">
        {minDD.toFixed(1)}%
      </text>
      <text x={PAD.left - 4} y={PAD.top + 4} fontSize="9" fill="#d1d5db" textAnchor="end" fontFamily="sans-serif">
        0%
      </text>
      {/* X labels */}
      {data.map((d, i) => !xIdxs.has(i) ? null : (
        <text key={i} x={toX(i)} y={H - 4} fontSize="9" fill="#d1d5db" textAnchor="middle" fontFamily="sans-serif">
          {fmtM(d.month)}
        </text>
      ))}
    </svg>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-1">
    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{title}</p>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const Metrics: React.FC = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { selectedPortfolioId, portfoliosLoaded } = useSelectedPortfolio();
  const [metrics, setMetrics]               = useState<MetricResponse | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [period, setPeriod]                 = useState<PeriodPreset>("ALL");
  // True first-buy date of the portfolio (obtained from the ALL-time fetch)
  const [portfolioStartDate, setPortfolioStartDate] = useState<string | null>(null);

  // Fetch whenever portfolio OR period changes — currency comes from the portfolio itself
  useEffect(() => {
    if (!selectedPortfolioId) return;
    setLoading(true);
    setError(null);
    const fromDate = presetToFromDate(period);
    portfolioService.getMetrics(selectedPortfolioId, fromDate)
      .then(m => {
        setMetrics(m);
        // When loading ALL, capture the true portfolio start date
        if (period === "ALL" && m.firstBuyDate) setPortfolioStartDate(m.firstBuyDate);
      })
      .catch(() => setError("Failed to load metrics"))
      .finally(() => setLoading(false));
  }, [selectedPortfolioId, period]);

  // Reset to ALL when portfolio changes
  useEffect(() => { setPeriod("ALL"); setPortfolioStartDate(null); }, [selectedPortfolioId]);

  // Presets available given actual portfolio age (no point picking a window longer than history)
  const availablePresets = useMemo((): PeriodPreset[] => {
    if (!portfolioStartDate) return Object.keys(PRESET_LABELS) as PeriodPreset[];
    const ageMonths = (Date.now() - new Date(portfolioStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return (Object.keys(PRESET_LABELS) as PeriodPreset[]).filter(p => {
      const months = PRESET_MONTHS[p];
      return months === null || months < ageMonths; // ALL always shown; others only if shorter than real history
    });
  }, [portfolioStartDate]);

  const cy = metrics?.currencyName ?? "EUR";

  // Monthly data is already period-scoped from the backend — use as-is for charts
  const filteredMonthly = useMemo(() => metrics?.monthlyData ?? [], [metrics]);

  // Realized metrics (Realized P&L, CAGR, TWR, XIRR, Volatility, Sharpe, Sortino)
  // are only meaningful when the user has at least one sell transaction.
  // totalReturned = totalSells + totalDividends — if equal to totalDividends → no sells.
  const hasSells = (metrics?.totalReturned ?? 0) - (metrics?.totalDividends ?? 0) > 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 text-xl font-bold tracking-tight">Performance Metrics</h2>
        <p className="text-gray-500 text-sm mt-0.5">In-depth analysis of your portfolio's performance.</p>
      </div>

      {/* No portfolio */}
      {portfoliosLoaded && !selectedPortfolioId && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
            <HiOutlineBriefcase className="text-purple-400" size={28} />
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-semibold text-base">No portfolio yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first portfolio to start tracking your investments.</p>
          </div>
          <button
            onClick={() => navigate("/home/portfolio", { state: { openCreateModal: true } })}
            className="mt-1 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Create a portfolio
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm">{error}</div>
      )}

      {metrics && !loading && (
        <>
          {/* ── Summary banner ─────────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
            {/* Top row: MTM P&L (true total performance) */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-white/15">
              <div className="flex-1">
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">
                  Total P&amp;L {metrics.portfolioMarketValue > 0 ? "(incl. unrealized)" : ""}
                </p>
                <p className={`text-3xl font-bold ${pos(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain) ? "text-emerald-300" : "text-rose-300"}`}>
                  {(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain) >= 0 ? "+" : ""}
                  {fmt(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain, cy, 0)}
                </p>
                <p className="text-purple-200 text-sm mt-0.5">
                  {metrics.portfolioMarketValue > 0
                    ? `${fmtPct(metrics.gainPercentMtm)} · CAGR ${fmtPct(metrics.cagrMtm)} · XIRR ${fmtPct(metrics.xirrMtm)}`
                    : `${fmtPct(metrics.gainPercent)}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Period</p>
                <p className="text-lg font-bold">{metrics.firstBuyDate ? formatPeriod(metrics.firstBuyDate) : "—"}</p>
                <select
                  value={availablePresets.includes(period) ? period : "ALL"}
                  onChange={e => setPeriod(e.target.value as PeriodPreset)}
                  className="mt-1.5 text-[11px] bg-white/10 text-purple-100 border border-white/20 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {availablePresets.map(p => (
                    <option key={p} value={p} className="text-gray-800 bg-white">{PRESET_LABELS[p]}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Bottom row: breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Invested</p>
                <p className="font-bold">{fmt(metrics.totalInvested, cy, 0)}</p>
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Realized</p>
                <p className="font-bold">{fmt(metrics.totalReturned, cy, 0)}</p>
              </div>
              {metrics.portfolioMarketValue > 0 ? (
                <div>
                  <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Portfolio Value</p>
                  <p className="font-bold text-emerald-300">{fmt(metrics.portfolioMarketValue, cy, 0)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Net Gain</p>
                  <p className={`font-bold ${pos(metrics.gain) ? "text-emerald-300" : "text-rose-300"}`}>
                    {metrics.gain >= 0 ? "+" : ""}{fmt(metrics.gain, cy, 0)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Dividends</p>
                <p className="font-bold">{fmt(metrics.totalDividends, cy, 0)}</p>
              </div>
            </div>
          </div>

          {/* ── Dividend income (always shown) ─────────────────────────────── */}
          <div>
            <SectionHeader title="Income" subtitle="Dividends received from your holdings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
              <MetricCard
                label="Dividend Income"
                value={fmt(metrics.totalDividends, cy, 0)}
                subtitle={`Yield: ${metrics.dividendYield.toFixed(2)}%`}
                description="Total dividends received, converted to your target currency. Yield = dividends ÷ total invested."
                icon={<HiOutlineBanknotes size={18} />}
                positive={metrics.totalDividends > 0}
                neutral={metrics.totalDividends === 0}
              />
            </div>
          </div>

          {/* ── Returns + Risk — only shown when there are sell transactions ── */}
          {hasSells ? (
            <>
              <div>
                <SectionHeader title="Returns" subtitle="How much value you created from your investments" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  <MetricCard
                    label="Realized P&L"
                    value={fmtPct(metrics.gainPercent)}
                    subtitle={`${metrics.gain >= 0 ? "+" : ""}${fmt(metrics.gain, cy, 0)} · cash flows only`}
                    description="Return on capital computed from realized cash flows only: (sells + dividends − buys) / buys × 100. Does NOT include the current market value of positions still held."
                    icon={pos(metrics.gainPercent) ? <HiOutlineArrowTrendingUp size={18} /> : <HiOutlineArrowTrendingDown size={18} />}
                    positive={pos(metrics.gainPercent)}
                  />
                  <MetricCard
                    label="CAGR"
                    value={fmtPct(metrics.cagr)}
                    subtitle="per year, compounded"
                    description="Compound Annual Growth Rate — the equivalent fixed annual return that would take your invested capital to the realized return over the same period. Meaningful only with 1+ year of history."
                    icon={<HiOutlineChartBar size={18} />}
                    positive={pos(metrics.cagr)}
                  />
                  <MetricCard
                    label="TWR"
                    value={fmtPct(metrics.twr)}
                    subtitle={`${fmtPct(metrics.twrAnnualized)} / yr`}
                    description="Time-Weighted Return — chains monthly sub-period returns together so new deposits don't distort the measure. Annualized = equivalent fixed yearly rate."
                    icon={<HiOutlineArrowPath size={18} />}
                    positive={pos(metrics.twr)}
                    tag="chain-linked"
                  />
                  <MetricCard
                    label="Log Return (TWR)"
                    value={`${metrics.logTwr.toFixed(1)}%`}
                    subtitle="continuously compounded"
                    description="ln(1 + TWR/100) × 100. The continuously compounded equivalent of the TWR. Log returns are additive over time."
                    icon={<HiOutlineCalculator size={18} />}
                    positive={pos(metrics.logTwr)}
                    tag="continuous"
                  />
                  <MetricCard
                    label="XIRR"
                    value={fmtPct(metrics.xirr)}
                    subtitle="per year, time-weighted cash flows"
                    description="Internal Rate of Return accounting for the exact dates of every buy, sell, and dividend. More accurate than CAGR when flows are irregular."
                    icon={<HiOutlineCalculator size={18} />}
                    positive={pos(metrics.xirr)}
                    tag="IRR"
                  />
                </div>
              </div>

              <div>
                <SectionHeader title="Risk" subtitle="How much your portfolio fluctuates and how well you are compensated for it" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  <MetricCard
                    label="Volatility"
                    value={`${metrics.volatility.toFixed(1)}%`}
                    subtitle="annualized, monthly std dev"
                    description="Standard deviation of monthly returns × √12. Measures how much your realized returns swing up and down each month. Lower = more stable."
                    icon={<HiOutlineScale size={18} />}
                    neutral
                  />
                  <MetricCard
                    label="Sharpe Ratio"
                    value={metrics.sharpeRatio.toFixed(1)}
                    subtitle="(TWR − 4% rf) ÷ volatility"
                    description="Risk-adjusted return: (annualized TWR − risk-free rate) ÷ annualized volatility. Above 1 = good, above 2 = excellent, below 0 = risk isn't compensated."
                    icon={<HiOutlineSparkles size={18} />}
                    positive={metrics.sharpeRatio >= 1}
                    neutral={metrics.sharpeRatio > 0 && metrics.sharpeRatio < 1}
                    tag="risk-adj."
                  />
                  <MetricCard
                    label="Sortino Ratio"
                    value={metrics.sortinoRatio.toFixed(1)}
                    subtitle="downside deviation only"
                    description="Like Sharpe but divides by downside deviation — only months below the risk-free rate count as 'risk'. Penalizes harmful volatility, not upside swings."
                    icon={<HiOutlineSparkles size={18} />}
                    positive={metrics.sortinoRatio >= 1}
                    neutral={metrics.sortinoRatio > 0 && metrics.sortinoRatio < 1}
                    tag="risk-adj."
                  />
                  <MetricCard
                    label="Period"
                    value={metrics.firstBuyDate ? formatPeriod(metrics.firstBuyDate) : "—"}
                    subtitle={metrics.firstBuyDate ? `Since ${metrics.firstBuyDate}` : "No buys yet"}
                    description="Time window of the selected period. The longer the period, the more reliable all other metrics become — especially CAGR, Sharpe, and Sortino."
                    icon={<HiOutlineClock size={18} />}
                    neutral
                  />
                  <MetricCard
                    label="Max Drawdown"
                    value={`-${metrics.maxDrawdown.toFixed(1)}%`}
                    subtitle={metrics.maxDrawdownDurationMonths > 0 ? `${metrics.maxDrawdownDurationMonths} month${metrics.maxDrawdownDurationMonths !== 1 ? "s" : ""} duration` : "—"}
                    description="The largest peak-to-trough decline in your realized portfolio value. Measures worst-case loss before a new high was reached."
                    icon={<HiOutlineArrowTrendingDown size={18} />}
                    positive={metrics.maxDrawdown === 0}
                    neutral={metrics.maxDrawdown > 0 && metrics.maxDrawdown < 10}
                  />
                </div>
              </div>
            </>
          ) : (
            /* ── No sells placeholder ──────────────────────────────────────── */
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <HiOutlineArrowTrendingUp className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-sm">Sell transactions required</p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs leading-relaxed">
                  Realized P&L, CAGR, TWR, XIRR, Volatility, Sharpe and Sortino are computed from
                  cash flows only. Add at least one sell transaction to unlock these metrics.
                </p>
              </div>
            </div>
          )}

          {/* ── Methodology note ────────────────────────────────────────────── */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <HiOutlineInformationCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Total P&L, CAGR, and XIRR</strong> (banner above) include the current market value
              of held positions — this is the true economic performance.
              {hasSells && <> <strong>Realized P&L</strong> counts only cash already received (sells + dividends).</>}
              {" "}All amounts are converted to {cy}.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Metrics;
