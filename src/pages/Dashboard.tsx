import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import PortfolioService from "../services/PortfolioService";
import ActivationModal from "../components/ActivationModal";
import AccountActivatedModal from "../components/AccountActivatedModal";
import DmStatCard from "../components/DmStatCard";
import DmLineChart from "../components/DmLineChart";
import SectorBreakdown from "../components/SectorBreakdown";
import MetricStrip from "../components/MetricStrip";
import type { DmStatUI } from "../models/UI/DmStatUI";
import type { MetricResponse } from "../responses/MetricResponse";
import type { PortfolioTotalResponse } from "../responses/PortfolioTotalResponse";

const portfolioService = PortfolioService.getInstance();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number, cy: string, decimals = 0) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: cy, maximumFractionDigits: decimals }).format(v);

const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, sendActivationEmail } = useAuth();
  const { selectedPortfolioId, portfoliosLoaded } = useSelectedPortfolio();

  const [showActivationModal,       setShowActivationModal]       = useState(false);
  const [showAccountActivatedModal, setShowAccountActivatedModal] = useState(false);
  const [metrics, setMetrics]   = useState<MetricResponse | null>(null);
  const [total,   setTotal]     = useState<PortfolioTotalResponse | null>(null);
  const [loading, setLoading]   = useState(false);

  // ─── Modals ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user?.activated === false && sessionStorage.getItem("justLoggedIn") === "true") {
      setShowActivationModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (sessionStorage.getItem("accountJustActivated") === "true") {
      setShowAccountActivatedModal(true);
    }
  }, []);

  // ─── Data fetch ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedPortfolioId) { setMetrics(null); setTotal(null); return; }
    setLoading(true);
    Promise.all([
      portfolioService.getMetrics(selectedPortfolioId),
      portfolioService.getPortfolioTotal(selectedPortfolioId).catch(() => null),
    ])
      .then(([m, t]) => { setMetrics(m); setTotal(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPortfolioId]);

  // ─── Stat cards ────────────────────────────────────────────────────────────

  const cy = metrics?.currencyName ?? total?.currencyName ?? "EUR";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const dashStats: DmStatUI[] = metrics ? [
    {
      label: "Portfolio value",
      value: total ? fmt(total.totalValue, cy) : "—",
      delta: `${fmtPct(metrics.gainPercent)} all time`,
      up:    metrics.gain >= 0,
    },
    {
      label: "Net gain",
      value: fmt(metrics.gain, cy),
      delta: `${fmtPct(metrics.gainPercent)} on invested`,
      up:    metrics.gain >= 0,
    },
    {
      label: "Sharpe ratio",
      value: metrics.sharpeRatio.toFixed(2),
      delta: `CAGR ${fmtPct(metrics.cagr)} / yr`,
      up:    metrics.sharpeRatio >= 1,
    },
    {
      label: "Volatility",
      value: `${metrics.volatility.toFixed(1)}%`,
      delta: "annualized",
      up:    false,
      neutral: true,
    },
  ] : [];

  return (
    <div>
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => { sessionStorage.removeItem("justLoggedIn"); setShowActivationModal(false); }}
        onSendEmail={async () => {
          try { await sendActivationEmail(); toast.success("Activation email sent! Check your inbox."); }
          catch { toast.error("Failed to send the email. Please try again."); }
        }}
      />
      <AccountActivatedModal
        isOpen={showAccountActivatedModal}
        onClose={() => { sessionStorage.removeItem("accountJustActivated"); setShowAccountActivatedModal(false); }}
      />

      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">
              {greeting}{user?.firstName ? `, ${user.firstName}` : ""}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your portfolio today.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => selectedPortfolioId && navigate(`/home/portfolio/${selectedPortfolioId}/transactions`)}
              className="px-3.5 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer font-medium shadow-sm shadow-purple-200"
            >
              + Add transaction
            </button>
          </div>
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

        {/* Stat cards */}
        {portfoliosLoaded && selectedPortfolioId && (
          loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {dashStats.map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                  <DmStatCard stat={stat} />
                </div>
              ))}
            </div>
          )
        )}

        {/* Chart + allocation */}
        {portfoliosLoaded && selectedPortfolioId && (
          loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className="lg:col-span-2 h-52" />
              <Skeleton className="h-52" />
            </div>
          ) : metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                <DmLineChart data={metrics.monthlyData} currency={cy} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                <SectorBreakdown holdings={metrics.topHoldings} />
              </div>
            </div>
          )
        )}

        {/* Metric strip */}
        {portfoliosLoaded && selectedPortfolioId && (
          loading ? (
            <Skeleton className="h-20" />
          ) : metrics && metrics.totalInvested > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Performance metrics</p>
              <MetricStrip metrics={metrics} />
            </div>
          )
        )}

        {/* Empty state */}
        {!loading && metrics && metrics.totalInvested === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-600 font-medium">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first buy to start tracking your portfolio.</p>
            <button
              onClick={() => navigate(`/home/portfolio/${selectedPortfolioId}/transactions`)}
              className="mt-4 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Go to Transactions
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
