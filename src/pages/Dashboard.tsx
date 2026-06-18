import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
  HiOutlineBanknotes, HiOutlineChartBar, HiOutlineSparkles,
  HiOutlineScale, HiOutlineArrowRightCircle, HiOutlineBriefcase,
} from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import ActivationModal from "../components/ActivationModal";
import AccountActivatedModal from "../components/AccountActivatedModal";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import type { MetricResponse, MonthlyDataPoint } from "../responses/MetricResponse";
import NoPortfolioSelected from "../components/Error/NoPortfolioSelected";

const portfolioService = PortfolioService.getInstance();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number, cy: string, decimals = 0) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: cy, maximumFractionDigits: decimals }).format(v);

const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
const isPos  = (v: number) => v >= 0;

// ─── Mini sparkline ───────────────────────────────────────────────────────────

const Sparkline: React.FC<{ data: MonthlyDataPoint[] }> = ({ data }) => {
  const pts = data.slice(-12);
  if (pts.length < 2) return null;
  const gains = pts.map(d => d.netGain);
  const min = Math.min(...gains);
  const max = Math.max(...gains, 1);
  const range = max - min || 1;
  const W = 100, H = 32;
  const points = pts.map((d, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((d.netGain - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");
  const lastPositive = gains[gains.length - 1] >= 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-16 h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={lastPositive ? "#8b5cf6" : "#f43f5e"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─── Allocation donut (SVG) ───────────────────────────────────────────────────

const PALETTE = ["#8b5cf6", "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

const DonutChart: React.FC<{ data: Array<{ label: string; pct: number }> }> = ({ data }) => {
  const R = 40, CX = 50, CY = 50, stroke = 14;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  const segments = data.map((d, i) => {
    const dash = (d.pct / 100) * circumference;
    const seg = (
      <circle
        key={d.label}
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={PALETTE[i % PALETTE.length]}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)" }}
      />
    );
    offset += dash;
    return seg;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {segments}
    </svg>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  neutral?: boolean;
  icon: React.ReactNode;
  sparkline?: MonthlyDataPoint[];
}

const StatCard: React.FC<StatProps> = ({ label, value, sub, positive: isPositive, neutral, icon, sparkline }) => {
  const color  = neutral ? "text-gray-800" : isPositive ? "text-emerald-600" : "text-rose-500";
  const bgIcon = neutral ? "bg-purple-50 text-purple-500" : isPositive ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl ${bgIcon} flex items-center justify-center`}>
          {icon}
        </div>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, sendActivationEmail } = useAuth();
  const [showActivationModal,       setShowActivationModal]       = useState(false);
  const [showAccountActivatedModal, setShowAccountActivatedModal] = useState(false);

  const { selectedPortfolioId, portfoliosLoaded } = useSelectedPortfolio();
  const [metrics, setMetrics] = useState<MetricResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.activated === false && sessionStorage.getItem("justLoggedIn") === "true") {
      setShowActivationModal(true);
    }
    if (sessionStorage.getItem("accountJustActivated") === "true") {
      setShowAccountActivatedModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    setLoading(true);
    portfolioService.getMetrics(selectedPortfolioId)
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPortfolioId]);

  const cy = metrics?.currencyName ?? "EUR";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => { sessionStorage.removeItem("justLoggedIn"); setShowActivationModal(false); }}
        onSendEmail={async () => {
          try { await sendActivationEmail(); toast.success("Activation email sent!"); }
          catch { toast.error("Failed to send the email."); }
        }}
      />
      <AccountActivatedModal
        isOpen={showAccountActivatedModal}
        onClose={() => { sessionStorage.removeItem("accountJustActivated"); setShowAccountActivatedModal(false); }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-xl font-bold tracking-tight">
            {greeting}{user?.firstName ? `, ${user.firstName}` : ""}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your portfolio today.</p>
        </div>
      </div>

      {/* No portfolio state */}
      {portfoliosLoaded && !selectedPortfolioId && (
        <NoPortfolioSelected />
      )}

      {/* Stat cards */}
      {portfoliosLoaded && selectedPortfolioId && loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Net Gain"
            value={fmt(metrics.gain, cy)}
            sub={fmtPct(metrics.gainPercent)}
            positive={isPos(metrics.gain)}
            icon={isPos(metrics.gain) ? <HiOutlineArrowTrendingUp size={16} /> : <HiOutlineArrowTrendingDown size={16} />}
            sparkline={metrics.monthlyData}
          />
          <StatCard
            label="Total Invested"
            value={fmt(metrics.totalInvested, cy)}
            sub={`Since ${metrics.firstBuyDate ?? "—"}`}
            neutral
            icon={<HiOutlineChartBar size={16} />}
          />
          <StatCard
            label="Sharpe Ratio"
            value={metrics.sharpeRatio.toFixed(2)}
            sub={`CAGR ${fmtPct(metrics.cagr)} / yr`}
            positive={metrics.sharpeRatio >= 1}
            neutral={metrics.sharpeRatio > 0 && metrics.sharpeRatio < 1}
            icon={<HiOutlineSparkles size={16} />}
          />
          <StatCard
            label="Volatility"
            value={`${metrics.volatility.toFixed(1)}%`}
            sub="annualized"
            neutral
            icon={<HiOutlineScale size={16} />}
          />
        </div>
      ) : null}

      {/* Middle row */}
      {metrics && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Overview + bar chart */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Portfolio overview</p>
              <button
                onClick={() => navigate("/home/metrics")}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors"
              >
                Full metrics <HiOutlineArrowRightCircle size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total invested",    val: fmt(metrics.totalInvested, cy),   color: "text-gray-900" },
                { label: "Total returned",    val: fmt(metrics.totalReturned, cy),   color: "text-gray-900" },
                { label: "Dividends",         val: fmt(metrics.totalDividends, cy),  color: "text-emerald-600", sub: `Yield ${metrics.dividendYield.toFixed(1)}%` },
                { label: "Net gain",          val: `${metrics.gain >= 0 ? "+" : ""}${fmt(metrics.gain, cy)}`, color: isPos(metrics.gain) ? "text-emerald-600" : "text-rose-500" },
                { label: "CAGR",             val: `${fmtPct(metrics.cagr)} / yr`,   color: isPos(metrics.cagr) ? "text-emerald-600" : "text-rose-500" },
                { label: "Holding period",    val: `${metrics.periodYears} yrs`,     color: "text-gray-900" },
              ].map(({ label, val, color, sub }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className={`font-bold ${color}`}>{val}</p>
                  {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Bar chart */}
            {metrics.monthlyData.length > 1 && (() => {
              const visible = metrics.monthlyData.slice(-18);
              const absMax  = Math.max(...visible.map(d => Math.abs(d.netGain)), 1);
              return (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-2">Cumulative net gain</p>
                  <div className="flex items-end gap-0.5 h-14">
                    {visible.map(d => {
                      const pct = Math.abs(d.netGain) / absMax;
                      const green = d.netGain >= 0;
                      return (
                        <div key={d.month} title={`${d.month}: ${fmt(d.netGain, cy)}`}
                          className="flex-1 h-full flex items-end">
                          <div
                            className={`w-full rounded-t-sm ${green ? "bg-purple-400" : "bg-rose-400"}`}
                            style={{ height: `${Math.max(pct * 100, 3)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                    <span>{visible[0]?.month}</span>
                    <span>{visible[visible.length - 1]?.month}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Allocation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-4">Asset allocation</p>
            {metrics.topHoldings.length > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <DonutChart data={metrics.topHoldings.map(h => ({ label: h.companyName, pct: h.allocation }))} />
                </div>
                <div className="space-y-2">
                  {metrics.topHoldings.map((h, i) => (
                    <div key={h.companyName} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                        <span className="text-xs text-gray-700 truncate">{h.companyName}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-500 shrink-0 ml-2">{h.allocation.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                <HiOutlineChartBar size={32} />
                <p className="text-xs mt-2">No holdings data yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key ratios strip */}
      {metrics && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Key ratios</p>
            <button
              onClick={() => navigate("/home/metrics")}
              className="text-[12px] text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Gain",       val: fmtPct(metrics.gainPercent),        good: isPos(metrics.gainPercent) },
              { label: "CAGR",       val: `${fmtPct(metrics.cagr)} / yr`,     good: isPos(metrics.cagr) },
              { label: "Volatility", val: `${metrics.volatility.toFixed(1)}%`,good: null },
              { label: "Sharpe",     val: metrics.sharpeRatio.toFixed(2),     good: metrics.sharpeRatio >= 1 },
            ].map(({ label, val, good }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${good === null ? "text-gray-800" : good ? "text-emerald-600" : "text-rose-500"}`}>
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && metrics && metrics.totalInvested === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <HiOutlineBanknotes className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first buy to see metrics here.</p>
          <button
            onClick={() => navigate(`/home/portfolio/${selectedPortfolioId}/transactions`)}
            className="mt-4 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors cursor-pointer"
          >
            Go to Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
