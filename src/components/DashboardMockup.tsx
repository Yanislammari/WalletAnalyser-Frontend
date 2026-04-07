import type React from "react";
import DmLineChart from "./DmLineChart";
import SectorBreakdown from "./SectorBreakdown";
import MetricStrip from "./MetricStrip";
import DmStatCard from "./DmStatCard";
import type { DmStatUI } from "../models/UI/DmStatUI";

const dashboardMockupStats: DmStatUI[] = [
  { label: "Portfolio value", value: "€47,320", delta: "+12.4%", up: true },
  { label: "Total gain", value: "€5,180", delta: "+€420 this month", up: true },
  { label: "Sharpe ratio", value: "1.43", delta: "vs 0.91 S&P", up: true },
  { label: "Volatility", value: "11.2%", delta: "-2.1% vs last year", up: true },
];

const DashboardMockup: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="backdrop-blur-xl bg-white/80 border border-purple-100 rounded-2xl shadow-2xl shadow-purple-100/40 p-5 md:p-7">
        <div className="flex items-center gap-1.5 mb-5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-amber-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
          <div className="ml-4 flex-1 h-6 rounded-md bg-gray-100/80 max-w-[200px]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {dashboardMockupStats.map((stat) => (
            <DmStatCard key={stat.label} stat={stat} />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <DmLineChart />
          <SectorBreakdown />  
        </div>
          <MetricStrip />
      </div>
    </div>
  );
}

export default DashboardMockup;
