import type React from "react";
import type { PricingPlanUI } from "../models/UI/PricingPlanUI";
import PricingPlanCard from "./PricingPlanCard";
import { useNavigate, type NavigateFunction } from "react-router";

const pricingPlans: PricingPlanUI[] = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    description: "Everything you need to start tracking.",
    features: ["Portfolio overview", "Basic metrics", "Last 12 months of data"],
    featured: false,
    cta: "Get started",
    onClick: (nav : NavigateFunction) => {
      nav("/main")
    },
  },
  {
    name: "Pro",
    price: "€29.99",
    period: "/month",
    description: "Full depth for the serious investor.",
    features: ["Unlimited portfolios", "CSV import", "Benchmark comparison", "All advanced metrics", "5+ years of historical data"],
    featured: true,
    cta: "Upgrade to Pro",
    onClick: (nav : NavigateFunction) => {
      nav("/main")
    },
  },
];

const PricingSection: React.FC = () => {
  const nav = useNavigate();
  return (
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
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingPlanCard key={plan.name} plan={plan} nav={nav}/>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
