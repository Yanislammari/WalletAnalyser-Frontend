import type React from "react";
import DmLineChart from "./DmLineChart";
import SectorBreakdown from "./SectorBreakdown";
import MetricStrip from "./MetricStrip";
import DmStatCard from "./DmStatCard";
import type { DmStatUI } from "../models/UI/DmStatUI";
import type { MonthlyDataPoint, TopHolding, MetricResponse } from "../responses/MetricResponse";

const dashboardMockupStats: DmStatUI[] = [
  { label: "Portfolio value", value: "€47,320", delta: "+12.4% all time",      up: true },
  { label: "Total gain",      value: "€5,180",  delta: "+12.4% on invested",   up: true },
  { label: "Sharpe ratio",    value: "1.43",     delta: "CAGR +8.20% / yr",    up: true },
  { label: "Volatility",      value: "11.2%",    delta: "annualized",           up: false, neutral: true },
];

const mockMonthlyData: MonthlyDataPoint[] = [
  { month: "2023-01", netGain: -800,  invested: 10000 },
  { month: "2023-02", netGain: -400,  invested: 12000 },
  { month: "2023-03", netGain: 200,   invested: 14000 },
  { month: "2023-04", netGain: 800,   invested: 16000 },
  { month: "2023-05", netGain: 1400,  invested: 18000 },
  { month: "2023-06", netGain: 900,   invested: 20000 },
  { month: "2023-07", netGain: 1800,  invested: 22000 },
  { month: "2023-08", netGain: 2600,  invested: 24000 },
  { month: "2023-09", netGain: 2100,  invested: 26000 },
  { month: "2023-10", netGain: 3200,  invested: 28000 },
  { month: "2023-11", netGain: 4000,  invested: 30000 },
  { month: "2023-12", netGain: 5180,  invested: 32000 },
];

const mockHoldings: TopHolding[] = [
  { companyName: "Technology",  invested: 17508, allocation: 37 },
  { companyName: "Healthcare",  invested: 9917,  allocation: 21 },
  { companyName: "Finance",     invested: 8514,  allocation: 18 },
  { companyName: "Textile",     invested: 6622,  allocation: 14 },
  { companyName: "Other",       invested: 4739,  allocation: 10 },
];

const mockMetrics: MetricResponse = {
  totalInvested: 42140, totalReturned: 47320,
  gain: 5180, gainPercent: 12.4,
  cagr: 8.2, volatility: 11.2, sharpeRatio: 1.43,
  sortinoRatio: 1.87,
  twr: 10.6, twrAnnualized: 10.4, logTwr: 10.1,
  xirr: 9.8,
  maxDrawdown: 5.2, maxDrawdownDurationMonths: 2,
  totalDividends: 980, dividendYield: 2.3,
  firstBuyDate: "2023-01-15", periodYears: 1.0,
  topHoldings: mockHoldings,
  monthlyData: mockMonthlyData,
  currencyId: "eur-id", currencyName: "EUR",
};

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
          {dashboardMockupStats.map(stat => (
            <DmStatCard key={stat.label} stat={stat} />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-2 bg-gray-50/80 rounded-xl p-4">
            <DmLineChart data={mockMonthlyData} currency="EUR" />
          </div>
          <SectorBreakdown holdings={mockHoldings} />
        </div>
        <div className="bg-gray-50/80 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Performance metrics</p>
          <MetricStrip metrics={mockMetrics} />
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;
