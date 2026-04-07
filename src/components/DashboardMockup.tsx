import type React from "react";

const chartData = [38, 52, 44, 61, 55, 70, 63, 80, 74, 91, 85, 100];
const chartMax = 100;
const chartW = 400;
const chartH = 120;

const pts = chartData.map((v, i) => {
  const x = (i / (chartData.length - 1)) * chartW;
  const y = chartH - (v / chartMax) * chartH;
  return `${x},${y}`;
}).join(" ");

const areaPath = `M0,${chartH} L${pts.split(" ").map(p => p).join(" L")} L${chartW},${chartH} Z`;

const metrics = [
  { key: "TWR", value: "+14.7%" },
  { key: "CAGR", value: "8.2%" },
  { key: "Sortino", value: "1.87" },
  { key: "XIRR", value: "9.1%" },
  { key: "Max DD", value: "−14.3%" },
  { key: "Log ret.", value: "7.8%" },
  { key: "MWRR", value: "8.6%" },
  { key: "Volatility", value: "11.2%" },
];

const dashboardMockupStats = [
  { label: "Portfolio value", value: "€47,320", delta: "+12.4%", up: true },
  { label: "Total gain", value: "€5,180", delta: "+€420 this month", up: true },
  { label: "Sharpe ratio", value: "1.43", delta: "vs 0.91 S&P", up: true },
  { label: "Volatility", value: "11.2%", delta: "-2.1% vs last year", up: true },
];

const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];

const sectorsStats = [
  { name: "Technology", pct: 38, color: "bg-purple-500" },
  { name: "Healthcare", pct: 22, color: "bg-indigo-400" },
  { name: "Finance", pct: 19, color: "bg-violet-300" },
  { name: "Other", pct: 21, color: "bg-purple-200" },
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
            <div key={stat.label} className="bg-gray-50/80 rounded-xl p-3.5">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">{stat.delta}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">

          {/* Line chart */}
          <div className="md:col-span-2 bg-gray-50/80 rounded-xl p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Portfolio value over time</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-24" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#areaGrad)" />
              <polyline points={pts} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {chartData.map((v, i) => {
                const x = (i / (chartData.length - 1)) * chartW;
                const y = chartH - (v / chartMax) * chartH;
                return i === chartData.length - 1 ? (
                  <circle key={i} cx={x} cy={y} r="4" fill="#7c3aed" />
                ) : null;
              })}
            </svg>
            <div className="flex justify-between mt-2">
              {months.map((month) => (
                <span key={month} className="text-[10px] text-gray-300">{month}</span>
              ))}
            </div>
          </div>

          {/* Sector breakdown */}
          <div className="bg-gray-50/80 rounded-xl p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Sector exposure</p>
            {sectorsStats.map((sector) => (
              <div key={sector.name} className="mb-2.5">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>{sector.name}</span>
                  <span className="font-medium text-gray-700">{sector.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${sector.color}`} style={{ width: `${sector.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom metrics strip */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-3">
          {metrics.map((metric) => (
            <div key={metric.key} className="bg-purple-50/60 border border-purple-100/60 rounded-lg p-2 text-center">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">{metric.key}</p>
              <p className="text-[13px] font-semibold text-purple-700 mt-0.5">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardMockup;
