import type React from "react";

const chartData = [38, 52, 44, 61, 55, 70, 63, 80, 74, 91, 85, 100];
const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];

const DmLineChart: React.FC = () => {
  const chartW = 400;
  const chartH = 112;
  const totalH = 140;
  const chartMax = 100;

  const pts = chartData.map((v, i) => {
    const x = (i / (chartData.length - 1)) * chartW;
    const y = chartH - (v / chartMax) * chartH;
    return `${x},${y}`;
  }).join(" ");

  const areaPath = `M0,${chartH} L${pts.split(" ").join(" L")} L${chartW},${chartH} Z`;

  return (
    <div className="md:col-span-2 bg-gray-50/80 rounded-xl p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">
        Portfolio value over time
      </p>
      <svg
        viewBox={`0 0 ${chartW} ${totalH}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {chartData.map((v, i) => {
          const x = (i / (chartData.length - 1)) * chartW;
          const y = chartH - (v / chartMax) * chartH;
          return i === chartData.length - 1 ? (
            <circle key={i} cx={x} cy={y} r="4" fill="#7c3aed" />
          ) : null;
        })}
        {months.map((month, i) => (
          <text
            key={month}
            x={(i / (months.length - 1)) * chartW}
            y={totalH - 6}
            fontSize="11"
            fill="#9ca3af"
            textAnchor={i === 0 ? "start" : i === months.length - 1 ? "end" : "middle"}
            fontFamily="sans-serif"
          >
            {month}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default DmLineChart;
