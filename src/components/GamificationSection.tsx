import React from "react";

const badges = [
  { label: "Diversified", dot: "#f59e0b", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.3)", text: "#92400e" },
  { label: "Low vol.", dot: "#14b8a6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.3)", text: "#0f6e56" },
  { label: "CAGR 10%+", dot: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)", text: "#534AB7" },
  { label: "Sharpe 1.5", dot: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.3)", text: "#3730a3" },
  { label: "1 year streak", dot: "#ec4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.3)", text: "#9d174d" },
  { label: "Beat index", dot: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)", text: "#14532d" },
];

const GamificationSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl py-38 px-8"
      style={{ background: "linear-gradient(135deg, #faf9ff 0%, #f3f0ff 40%, #ede8ff 100%)" }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <circle cx="680" cy="80" r="200" fill="none" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="680" cy="80" r="140" fill="none" stroke="#a78bfa" strokeWidth="0.6" opacity="0.4"/>
        <circle cx="680" cy="80" r="80"  fill="none" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3"/>
        <circle cx="120" cy="340" r="160" fill="none" stroke="#ddd6fe" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="680" cy="80" r="6" fill="#a78bfa" opacity="0.5"/>
        <line x1="200" y1="0" x2="200" y2="420" stroke="#ede9fe" strokeWidth="0.5" opacity="0.6"/>
        <line x1="400" y1="0" x2="400" y2="420" stroke="#ede9fe" strokeWidth="0.5" opacity="0.6"/>
        <line x1="600" y1="0" x2="600" y2="420" stroke="#ede9fe" strokeWidth="0.5" opacity="0.6"/>
        <line x1="0" y1="140" x2="800" y2="140" stroke="#ede9fe" strokeWidth="0.5" opacity="0.5"/>
        <line x1="0" y1="280" x2="800" y2="280" stroke="#ede9fe" strokeWidth="0.5" opacity="0.5"/>
        <path d="M580 10 L620 50 L580 50 Z" fill="#ede9fe" opacity="0.4"/>
      </svg>
      <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5 text-[11px] font-semibold tracking-wider text-violet-700"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5" fill="#8b5cf6" opacity="0.9"/>
            </svg>
            GAMIFICATION
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-indigo-950 mb-4">
            Earn badges.<br />
            <span className="text-violet-600">Stay motivated.</span>
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 mb-7 max-w-sm">
            Every week, WalletAnalyser awards you badges based on portfolio milestones — diversification, consistency, volatility control. Long-term wealth building, with the satisfaction loop of a game.
          </p>
          <div className="flex items-center gap-4">
            {[["12", "badges"], ["6", "categories"], ["∞", "motivation"]].map(([number, label], index) => (
              <React.Fragment key={label}>
                {index > 0 && <div className="w-px h-8 bg-gray-200" />}
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600 leading-none">{number}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(167,139,250,0.25)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}>
          <p className="text-[11px] font-semibold tracking-widest text-violet-400 mb-4">YOUR BADGES</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {badges.map((badge) => (
              <div key={badge.label}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium"
                style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: badge.dot }} />
                {badge.label}
              </div>
            ))}
          </div>
          <div className="border-t pt-4" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Weekly progress</span>
              <span className="text-xs font-semibold text-violet-600">4 / 6</span>
            </div>
            <div className="rounded-full h-1.5 overflow-hidden bg-violet-100">
              <div className="h-full w-2/3 rounded-full"
                style={{ background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GamificationSection;
