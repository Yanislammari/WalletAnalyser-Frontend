import type React from "react";
import MetricBadge from "./MetricBadge";
import MetricContainer from "./MetricContainer";

const metrics: string[] = ["CAGR", "TWR", "XIRR", "Sharpe ratio", "Sortino ratio", "Volatility", "Log returns", "Drawdown", "Max drawdown", "MWRR"];

const MetricSection: React.FC = () => {
  return (
    <section id="metrics" className="relative bg-[#0d0a1a] py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 h-full w-[50%]" viewBox="0 0 500 1000" preserveAspectRatio="none">
          <path d="M500,0 Q100,500 300,1000 L0,1000 L0,0 Z" fill="rgba(139,92,246,0.05)" />
        </svg>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-[0.15em] mb-4">Metrics</p>
            <h2 className="text-4xl font-bold text-white leading-tight mb-5 tracking-tight">
              The numbers serious<br />investors track
            </h2>
            <p className="text-white/50 text-[15px] leading-relaxed mb-10">
              Go beyond simple returns. WalletAnalyser surfaces the metrics that tell you how your portfolio is performing — and why.
            </p>
            <div className="flex flex-wrap gap-2">
              {metrics.map((metric) => (
                <MetricBadge key={metric} metricName={metric} />
              ))}
            </div>
          </div>
          <MetricContainer />
        </div>
      </div>
    </section>
  );
}

export default MetricSection;
