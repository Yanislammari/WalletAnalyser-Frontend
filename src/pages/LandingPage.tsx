import React from "react";
import HeroBanner from "../components/HeroBanner";
import FeatureSection from "../components/FeatureSection";
import MetricSection from "../components/MetricSection";
import GamificationSection from "../components/GamificationSection";
import ExcelImportSection from "../components/ExcelImportSection";
import PricingSection from "../components/PricingSection";
import FaqSection from "../components/FaqSection";
import CtaSection from "../components/CtaSection";

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
      <CtaSection />
      {/* ── CTA ──────────────────────────────────────────────── */}
      

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
