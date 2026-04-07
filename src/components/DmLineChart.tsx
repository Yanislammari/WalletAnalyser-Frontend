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

const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];
const areaPath = `M0,${chartH} L${pts.split(" ").map(p => p).join(" L")} L${chartW},${chartH} Z`;

const DmLineChart: React.FC = () => {
  return (
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
  );
}

export default DmLineChart;
