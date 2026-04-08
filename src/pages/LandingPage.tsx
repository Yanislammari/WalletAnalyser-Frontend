import React from "react";
import HeroBanner from "../components/HeroBanner";
import FeatureSection from "../components/FeatureSection";
import MetricSection from "../components/MetricSection";
import GamificationSection from "../components/GamificationSection";
import ExcelImportSection from "../components/ExcelImportSection";
import PricingSection from "../components/PricingSection";
import FaqSection from "../components/FaqSection";
import CtaSection from "../components/CtaSection";
import LpFooter from "../components/LpFooter";

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
      <LpFooter />
    </div>
  );
}

export default LandingPage;
