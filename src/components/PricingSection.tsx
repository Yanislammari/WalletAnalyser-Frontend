import type React from "react";
import type { PricingPlan } from "../models/UI/PricingPlanUI";

const pricingPlans: PricingPlan[] = [
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
              <p className={`text-[13px] mb-6 mt-1 leading-relaxed ${plan.featured ? "text-purple-200/80" : "text-white/40"}`}>{plan.description}</p>
              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? "rgba(255,255,255,0.8)" : "rgba(139,92,246,0.8)"} strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className={`text-[13px] ${plan.featured ? "text-white/90" : "text-white/55"}`}>{feature}</span>
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
  );
}

export default PricingSection;
