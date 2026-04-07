import type React from "react";

const compareRows = [
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

      {/* Mini line chart comparing two portfolios */}
      <svg viewBox="0 0 400 100" className="w-full h-24 mb-5" preserveAspectRatio="none">
        <defs>
          <linearGradient id="yourGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* benchmark line */}
        <polyline
          points="0,85 50,78 100,82 150,65 200,72 250,58 300,63 350,50 400,42"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"
          strokeLinejoin="round" strokeLinecap="round"
        />
        {/* yours */}
        <path d="M0,100 L0,85 50,72 100,78 150,58 200,62 250,45 300,50 350,35 400,20 L400,100 Z" fill="url(#yourGrad)" />
        <polyline
          points="0,85 50,72 100,78 150,58 200,62 250,45 300,50 350,35 400,20"
          fill="none" stroke="#7c3aed" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round"
        />
      </svg>

      <div className="space-y-1">
        <div className="flex text-[11px] text-white/30 uppercase tracking-widest pb-2 border-b border-white/[0.06]">
          <span className="flex-1">Metric</span>
          <span className="w-20 text-right text-purple-400/80">Yours</span>
          <span className="w-20 text-right">S&P 500</span>
        </div>
        {compareRows.map((row) => (
          <div key={row.label} className="flex items-center py-2 border-b border-white/[0.04]">
            <span className="flex-1 text-[13px] text-white/50">{row.label}</span>
            <span className="w-20 text-right text-[13px] font-semibold text-emerald-400">{row.yours}</span>
            <span className="w-20 text-right text-[13px] text-white/30">{row.bench}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MetricContainer;
