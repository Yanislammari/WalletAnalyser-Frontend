import type React from "react";

const metrics = [
  { key: "TWR", value: "+14.7%" },
  { key: "CAGR", value: "8.2%" },
  { key: "Sortino", value: "1.87" },
  { key: "XIRR", value: "9.1%" },
  { key: "Max DD", value: "-14.3%" },
  { key: "Log ret.", value: "7.8%" },
  { key: "MWRR", value: "8.6%" },
  { key: "Volatility", value: "11.2%" },
];

const MetricStrip: React.FC = () => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-3">
      {metrics.map((metric) => (
        <div key={metric.key} className="bg-purple-50/60 border border-purple-100/60 rounded-lg p-2 text-center">
          <p className="text-[9px] text-gray-400 uppercase tracking-wide">{metric.key}</p>
          <p className="text-[13px] font-semibold text-purple-700 mt-0.5">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

export default MetricStrip;
