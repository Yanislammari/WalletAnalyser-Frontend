import type React from "react";
import McLineChart from "./McLineChart";
import type { CompareRow } from "../models/entities/CompareRow";
import CompareRowMetrics from "./CompareRowMetrics";

const compareRows: CompareRow[] = [
  { label: "Total gain", yours: "+31.4%", bench: "+24.1%", positive: true },
  { label: "CAGR", yours: "8.2%", bench: "7.1%", positive: true },
  { label: "Volatility", yours: "11.2%", bench: "14.8%", positive: true },
  { label: "Sharpe ratio", yours: "1.43", bench: "0.91", positive: true },
  { label: "Max drawdown", yours: "-14.3%", bench: "-19.7%", positive: true },
];

const MetricContainer: React.FC = () => {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div className="flex justify-between items-center mb-5">
        <p className="text-white/40 text-[11px] uppercase tracking-widest">Portfolio vs S&P 500</p>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-purple-400">
            <span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" />Yours
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
            <span className="w-2 h-2 rounded-sm bg-white/20 inline-block" />S&P 500
          </span>
        </div>
      </div>
      <McLineChart />
      <div className="space-y-1">
        <div className="flex text-[11px] text-white/30 uppercase tracking-widest pb-2 border-b border-white/[0.06]">
          <span className="flex-1">Metric</span>
          <span className="w-20 text-right text-purple-400/80">Yours</span>
          <span className="w-20 text-right">S&P 500</span>
        </div>
        {compareRows.map((row) => (
          <CompareRowMetrics key={row.label} row={row} />
        ))}
      </div>
    </div>
  );
}

export default MetricContainer;
