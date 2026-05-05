import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";
import DmStatCard from "../components/DmStatCard";
import DmLineChart from "../components/DmLineChart";
import SectorBreakdown from "../components/SectorBreakdown";
import MetricStrip from "../components/MetricStrip";
import ActivationModal from "../components/ActivationModal";
import AccountActivatedModal from "../components/AccountActivatedModal";
import type { DmStatUI } from "../models/UI/DmStatUI";

const dashStats: DmStatUI[] = [
  { label: "Portfolio value", value: "€47,320", delta: "+12.4%", up: true },
  { label: "Total gain", value: "€5,180", delta: "+€420 this month", up: true },
  { label: "Sharpe ratio", value: "1.43", delta: "vs 0.91 S&P", up: true },
  { label: "Volatility", value: "11.2%", delta: "-2.1% vs last year", up: true },
];

const Dashboard: React.FC = () => {
  const { user, sendActivationEmail } = useAuth();
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);
  const [showAccountActivatedModal, setShowAccountActivatedModal] = useState<boolean>(false);

  const handleSendActivationEmail = async () => {
    try {
      await sendActivationEmail();
      toast.success("Activation email sent! Check your inbox.");
    }
    catch {
      toast.error("Failed to send the email. Please try again.");
    }
  };

  const handleCloseActivationModal = () => {
    sessionStorage.removeItem("justLoggedIn");
    setShowActivationModal(false);
  };

  const handleCloseAccountActivatedModal = () => {
    sessionStorage.removeItem("accountJustActivated");
    setShowAccountActivatedModal(false);
  };

  useEffect(() => {
    if (user && user.activated === false && sessionStorage.getItem("justLoggedIn") === "true") {
      setShowActivationModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (sessionStorage.getItem("accountJustActivated") === "true") {
      setShowAccountActivatedModal(true);
    }
  }, []);

  return (
    <div>
      <ActivationModal
        isOpen={showActivationModal}
        onClose={handleCloseActivationModal}
        onSendEmail={handleSendActivationEmail}
      />
      <AccountActivatedModal
        isOpen={showAccountActivatedModal}
        onClose={handleCloseAccountActivatedModal}
      />
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">
              Good morning{user?.firstName ? `, ${user.firstName}` : ""}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your portfolio today.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3.5 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer font-medium">
              Export
            </button>
            <button className="px-3.5 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer font-medium shadow-sm shadow-purple-200">
              + Add asset
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {dashStats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
              <DmStatCard stat={stat} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Portfolio value over time</p>
              <div className="flex gap-1">
                {["1M", "3M", "6M", "1Y", "All"].map((p, i) => (
                  <button
                    key={p}
                    className={`px-2 py-1 text-[11px] rounded-lg font-medium cursor-pointer transition-colors ${
                      i === 3 ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <DmLineChart />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <SectorBreakdown />
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Performance metrics</p>
          <MetricStrip />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Recent activity</p>
            <button className="text-[12px] text-purple-600 hover:text-purple-700 font-medium cursor-pointer">View all</button>
          </div>
          <div className="space-y-2">
            {[
              { action: "Portfolio imported", detail: "Q1_2024.xlsx — 24 transactions", time: "2h ago", icon: "↑", color: "bg-indigo-100 text-indigo-600" },
              { action: "New benchmark set", detail: "S&P 500 added as reference", time: "Yesterday", icon: "◎", color: "bg-purple-100 text-purple-600" },
              { action: "Alert triggered", detail: "Volatility exceeded 15% threshold", time: "3 days ago", icon: "!", color: "bg-amber-100 text-amber-600" },
            ].map((item) => (
              <div key={item.action} className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.action}</p>
                  <p className="text-[12px] text-gray-400 truncate">{item.detail}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0 hidden sm:block">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
