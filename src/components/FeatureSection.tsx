import type React from "react";
import FeatureCard from "./FeatureCard";
import type { Feature } from "../models/entities/Feature";

const features: Feature[] = [
  {
    title: "CSV & Excel import",
    description: "Upload any brokerage export. Download our pre-formatted template, map your columns, and you're live in seconds.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="13" x2="12" y2="19" />
        <polyline points="9 16 12 19 15 16" />
      </svg>
    ),
  },
  {
    title: "Portfolio overview",
    description: "Real-time positions, P&L in euros and percent, exposure heatmaps by country and sector.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Benchmark comparison",
    description: "Stack your returns against any index. Sharpe, CAGR, TWR, volatility — side by side, across any time horizon.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Historical analysis",
    description: "Drill into past gains by country, sector, or position. Filter, sort, and understand what drove your returns.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Advanced metrics",
    description: "XIRR, Sortino, log returns, drawdown data — every metric that serious long-term investors track.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "AI clustering",
    description: "K-means analysis matches your portfolio to a reference archetype. Know your investing style at a glance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="19" cy="17" r="2" />
        <line x1="12" y1="7" x2="5" y2="15" />
        <line x1="12" y1="7" x2="19" y2="15" />
        <line x1="7" y1="17" x2="17" y2="17" />
      </svg>
    ),
  },
];

const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="relative bg-[#0d0a1a] py-28 px-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-700/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Core features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Everything you need,<br />nothing you don't
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
