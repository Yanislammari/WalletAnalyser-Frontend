import type React from "react";

const features = [
  {
    title: "CSV & Excel import",
    desc: "Upload any brokerage export. Download our pre-formatted template, map your columns, and you're live in seconds.",
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
    desc: "Real-time positions, P&L in euros and percent, exposure heatmaps by country and sector.",
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
    desc: "Stack your returns against any index. Sharpe, CAGR, TWR, volatility — side by side, across any time horizon.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Historical analysis",
    desc: "Drill into past gains by country, sector, or position. Filter, sort, and understand what drove your returns.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Advanced metrics",
    desc: "XIRR, Sortino, log returns, drawdown data — every metric that serious long-term investors track.",
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
    desc: "K-means analysis matches your portfolio to a reference archetype. Know your investing style at a glance.",
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
            <div
              key={index}
              className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-200"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-purple-600/0 group-hover:bg-purple-600/5 transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-[15px] mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
