import React, { useState } from "react";
import HeroBanner from "../components/HeroBanner";

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

const metrics = ["CAGR", "TWR", "XIRR", "Sharpe ratio", "Sortino ratio", "Volatility", "Log returns", "Drawdown", "Max drawdown", "MWRR"];

const compareRows = [
  { label: "Total gain", yours: "+31.4%", bench: "+24.1%", positive: true },
  { label: "CAGR", yours: "8.2%", bench: "7.1%", positive: true },
  { label: "Volatility", yours: "11.2%", bench: "14.8%", positive: true },
  { label: "Sharpe ratio", yours: "1.43", bench: "0.91", positive: true },
  { label: "Max drawdown", yours: "−14.3%", bench: "-19.7%", positive: true },
];

const pricingPlans = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    desc: "Everything you need to start tracking.",
    features: ["1 portfolio", "CSV & Excel import", "Portfolio overview", "Basic metrics"],
    featured: false,
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "€9",
    period: "/month",
    desc: "Full depth for the serious investor.",
    features: ["Unlimited portfolios", "Benchmark comparison", "All advanced metrics", "Historical analysis", "AI clustering", "Stress test scenarios"],
    featured: true,
    cta: "Start free trial",
  },
  {
    name: "Teams",
    price: "€29",
    period: "/month",
    desc: "For advisors managing multiple portfolios.",
    features: ["Everything in Pro", "Up to 10 users", "Admin dashboard", "Priority support"],
    featured: false,
    cta: "Contact us",
  },
];

const faqs = [
  {
    q: "What brokers and file formats are supported?",
    a: "WalletAnalyser accepts any CSV or Excel file. We provide a pre-formatted template and a visual example to guide column mapping. If your broker uses a custom export format, you can remap columns manually before importing.",
  },
  {
    q: "What is TWR and why does it matter?",
    a: "Time-Weighted Return measures portfolio performance independently of external cash flows — deposits and withdrawals. It's the standard metric used by fund managers to fairly compare performance across periods and portfolios.",
  },
  {
    q: "Can I add a stock that isn't in your database?",
    a: "Yes. You can create a custom stock and assign it a sector, country, and concentration. Our team reviews and validates new entries, which then become available to all users.",
  },
  {
    q: "Is my financial data secure?",
    a: "Your data is encrypted at rest and in transit. We never share or sell portfolio data. Each user only ever sees their own portfolios.",
  },
  {
    q: "Is there a mobile app?",
    a: "The full analytics experience is optimised for web. A mobile app is in development for key metrics and overview — the complete toolkit will remain on web.",
  },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        className="w-full text-left flex justify-between items-center py-5 text-white/90 font-medium text-[15px] hover:text-white transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p className="text-white/55 text-[14px] leading-relaxed pb-5 -mt-1">{a}</p>
      )}
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <HeroBanner />

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="relative bg-[#0d0a1a] py-28 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-700/15 blur-[100px]" />
          {/* subtle grid */}
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
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-200"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-purple-600/0 group-hover:bg-purple-600/5 transition-all duration-300" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS ──────────────────────────────────────────── */}
      <section id="metrics" className="relative bg-[#0d0a1a] py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-0 left-0 h-full w-[50%]" viewBox="0 0 500 1000" preserveAspectRatio="none">
            <path d="M500,0 Q100,500 300,1000 L0,1000 L0,0 Z" fill="rgba(139,92,246,0.05)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <p className="text-purple-400 text-xs font-semibold uppercase tracking-[0.15em] mb-4">Metrics</p>
              <h2 className="text-4xl font-bold text-white leading-tight mb-5 tracking-tight">
                The numbers serious<br />investors track
              </h2>
              <p className="text-white/50 text-[15px] leading-relaxed mb-10">
                Go beyond simple returns. WalletAnalyser surfaces the metrics that tell you how your portfolio is performing — and why.
              </p>
              <div className="flex flex-wrap gap-2">
                {metrics.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/70 text-[13px] font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — comparison card */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 overflow-hidden relative">
              {/* subtle top gradient line */}
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
                {compareRows.map((r) => (
                  <div key={r.label} className="flex items-center py-2 border-b border-white/[0.04]">
                    <span className="flex-1 text-[13px] text-white/50">{r.label}</span>
                    <span className="w-20 text-right text-[13px] font-semibold text-emerald-400">{r.yours}</span>
                    <span className="w-20 text-right text-[13px] text-white/30">{r.bench}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMIFICATION strip ───────────────────────────────── */}
      <section className="relative bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 py-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Gamification</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
              Earn badges.<br />Stay motivated.
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed">
              Every week, WalletAnalyser awards you badges based on portfolio milestones — diversification, consistency, volatility control. Long-term wealth building, with the satisfaction loop of a game.
            </p>
          </div>
          {/* Badge showcase */}
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { label: "Diversified", color: "bg-amber-400/20 border-amber-400/40 text-amber-300" },
              { label: "Low vol.", color: "bg-teal-400/20 border-teal-400/40 text-teal-300" },
              { label: "CAGR 10%+", color: "bg-purple-400/20 border-purple-400/40 text-purple-200" },
              { label: "Sharpe 1.5", color: "bg-indigo-400/20 border-indigo-400/40 text-indigo-200" },
              { label: "1 year streak", color: "bg-pink-400/20 border-pink-400/40 text-pink-200" },
              { label: "Beat index", color: "bg-green-400/20 border-green-400/40 text-green-300" },
            ].map((b) => (
              <div
                key={b.label}
                className={`px-4 py-2 rounded-xl border text-[13px] font-semibold ${b.color} backdrop-blur-sm`}
              >
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="relative bg-[#0d0a1a] py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-800/20 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-[0.15em] mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-white tracking-tight">Simple, transparent pricing</h2>
            <p className="text-white/40 mt-3 text-[15px]">Start free. Upgrade when you need more depth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  plan.featured
                    ? "bg-purple-600 border-2 border-purple-400/50 shadow-2xl shadow-purple-900/40"
                    : "bg-white/[0.04] border border-white/[0.08]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most popular
                  </div>
                )}
                <p className={`text-sm font-medium mb-2 ${plan.featured ? "text-purple-200" : "text-white/40"}`}>{plan.name}</p>
                <p className={`text-4xl font-bold mb-1 tracking-tight ${plan.featured ? "text-white" : "text-white"}`}>
                  {plan.price}
                  <span className={`text-sm font-normal ${plan.featured ? "text-purple-300" : "text-white/30"}`}>{plan.period}</span>
                </p>
                <p className={`text-[13px] mb-6 mt-1 leading-relaxed ${plan.featured ? "text-purple-200/80" : "text-white/40"}`}>{plan.desc}</p>
                <div className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? "rgba(255,255,255,0.8)" : "rgba(139,92,246,0.8)"} strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className={`text-[13px] ${plan.featured ? "text-white/90" : "text-white/55"}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-white text-purple-700 hover:bg-purple-50"
                      : "bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="relative bg-[#0d0a1a] py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-[0.15em] mb-3">FAQ</p>
            <h2 className="text-4xl font-bold text-white tracking-tight">Common questions</h2>
          </div>
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative bg-[#0d0a1a] py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[400px] bg-purple-700/20 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-14">
            {/* subtle top line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
              Built for investors<br />who think long term
            </h2>
            <p className="text-white/50 mb-8 text-[15px] leading-relaxed">
              Stop guessing. Start understanding your portfolio with the depth it deserves.
            </p>
            <button className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-xl shadow-purple-900/40 text-[15px]">
              Create your free account
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#080613] border-t border-white/[0.05] px-8 md:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-bold tracking-tight text-white">
            Wallet<span className="text-purple-400">Analyser</span>
          </div>
          <p className="text-white/25 text-sm">© 2025 WalletAnalyser. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
