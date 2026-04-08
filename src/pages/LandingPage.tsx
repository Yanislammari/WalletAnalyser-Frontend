import React, { useState } from "react";
import HeroBanner from "../components/HeroBanner";
import FeatureSection from "../components/FeatureSection";
import MetricSection from "../components/MetricSection";
import GamificationSection from "../components/GamificationSection";
import ExcelImportSection from "../components/ExcelImportSection";
import PricingSection from "../components/PricingSection";
import FaqSection from "../components/FaqSection";

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
      <FeatureSection />
      <ExcelImportSection />
      <MetricSection />
      <GamificationSection />
      <PricingSection />
      <FaqSection />

      {/* ── FAQ ──────────────────────────────────────────────── */}
      

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
