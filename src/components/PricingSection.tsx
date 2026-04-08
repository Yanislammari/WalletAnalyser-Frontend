import type React from "react";
import type { PricingPlanUI } from "../models/UI/PricingPlanUI";
import PricingPlanCard from "./PricingPlanCard";

const pricingPlans: PricingPlanUI[] = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    description: "Everything you need to start tracking.",
    features: ["1 portfolio", "CSV & Excel import", "Portfolio overview", "Basic metrics"],
    featured: false,
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "€9",
    period: "/month",
    description: "Full depth for the serious investor.",
    features: ["Unlimited portfolios", "Benchmark comparison", "All advanced metrics", "Historical analysis", "AI clustering", "Stress test scenarios"],
    featured: true,
    cta: "Start free trial",
  },
  {
    name: "Teams",
    price: "€29",
    period: "/month",
    description: "For advisors managing multiple portfolios.",
    features: ["Everything in Pro", "Up to 10 users", "Admin dashboard", "Priority support"],
    featured: false,
    cta: "Contact us",
  },
];

const PricingSection: React.FC = () => {
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
        <div className="grid md:grid-cols-3 gap-5">
          {pricingPlans.map((plan) => (
            <PricingPlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
