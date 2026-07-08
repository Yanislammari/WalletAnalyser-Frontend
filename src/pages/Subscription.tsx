import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineSparkles, HiOutlineCreditCard, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import SubscriptionService, { type SubscriptionStatus } from "../services/SubscriptionService";
import { toast } from "sonner";

const FREE_FEATURES = [
  "1 portfolio",
  "Up to 1 year of history",
  "Portfolio overview",
  "Basic metrics",
];

const PRO_FEATURES = [
  "Unlimited portfolios",
  "Full historical data (5+ years)",
  "Benchmark comparison",
  "All advanced metrics",
  "Import data (CSV / Excel)",
  "Historical analysis",
  "AI clustering",
  "Priority support",
];

const Subscription: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const subscriptionService = SubscriptionService.getInstance();

  const isPro = user?.subscribe ?? false;

  useEffect(() => {
    // Handle Stripe redirect
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "1") {
      toast.success("🎉 Welcome to Pro! Your subscription is now active.");
      refreshUser();
      setSearchParams({}, { replace: true });
    } else if (canceled === "1") {
      toast.info("Checkout canceled.");
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    subscriptionService.getStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [user?.subscribe]);

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const url = await subscriptionService.createCheckoutSession();
      window.location.href = url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
      setActionLoading(false);
    }
  };

  const handleManage = async () => {
    setActionLoading(true);
    try {
      const url = await subscriptionService.createPortalSession();
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal.");
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your plan and billing.</p>
      </div>

      {/* Current plan banner */}
      <div className={`rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 ${
        isPro
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          : "bg-gray-50 border border-gray-100"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isPro ? "bg-white/20" : "bg-purple-100"
          }`}>
            <HiOutlineSparkles size={24} className={isPro ? "text-white" : "text-purple-600"} />
          </div>
          <div>
            <p className={`font-semibold text-lg ${isPro ? "text-white" : "text-gray-900"}`}>
              {isPro ? "Pro Plan" : "Free Plan"}
            </p>
            {isPro && status?.currentPeriodEnd && (
              <p className="text-white/70 text-sm">
                {status.cancelAtPeriodEnd
                  ? `Cancels on ${formatDate(status.currentPeriodEnd)}`
                  : `Renews on ${formatDate(status.currentPeriodEnd)}`
                }
              </p>
            )}
            {!isPro && (
              <p className="text-gray-500 text-sm">Upgrade to unlock all features</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          {isPro ? (
            <button
              onClick={handleManage}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineCreditCard size={16} />
              {actionLoading ? "Loading..." : "Manage billing"}
              <HiOutlineArrowTopRightOnSquare size={14} />
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? "Loading..." : "Upgrade to Pro — €29.99/mo"}
            </button>
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Free */}
        <div className={`rounded-2xl border p-6 ${!isPro ? "border-purple-300 ring-2 ring-purple-200" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-900">Free</p>
            {!isPro && (
              <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Current plan</span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">€0 <span className="text-sm font-normal text-gray-400">/month</span></p>
          <p className="text-gray-400 text-sm mb-5">Start tracking for free.</p>
          <div className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <HiOutlineCheckCircle size={16} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5">
              <HiOutlineXCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-sm text-gray-400">Comparisons page</span>
            </div>
            <div className="flex items-center gap-2.5">
              <HiOutlineXCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-sm text-gray-400">Import data</span>
            </div>
          </div>
        </div>

        {/* Pro */}
        <div className={`rounded-2xl border p-6 relative ${isPro ? "border-purple-300 ring-2 ring-purple-200" : "border-gray-100"}`}>
          {!isPro && (
            <div className="absolute -top-3 left-6 bg-amber-400 text-amber-900 text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
              Recommended
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-900">Pro</p>
            {isPro && (
              <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Current plan</span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">€29.99 <span className="text-sm font-normal text-gray-400">/month</span></p>
          <p className="text-gray-400 text-sm mb-5">Full depth for the serious investor.</p>
          <div className="space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <HiOutlineCheckCircle size={16} className="text-purple-500 shrink-0" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>
          {!isPro && (
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? "Loading..." : "Get started with Pro"}
            </button>
          )}
        </div>
      </div>

      {/* Cancel info */}
      {isPro && !status?.cancelAtPeriodEnd && (
        <p className="mt-6 text-center text-xs text-gray-400">
          To cancel your subscription, use the{" "}
          <button onClick={handleManage} className="text-purple-500 hover:underline cursor-pointer">
            billing portal
          </button>
          .
        </p>
      )}
    </div>
  );
};

export default Subscription;
