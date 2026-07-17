import type React from "react";
import type { PricingPlanUI } from "../models/UI/PricingPlanUI";
import { useRef } from "react";
import type { NavigateFunction } from "react-router-dom";

interface PricingPlanCardProps {
  plan: PricingPlanUI;
  nav: NavigateFunction;
}

const PricingPlanCard: React.FC<PricingPlanCardProps> = (props: PricingPlanCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card: HTMLDivElement | null = cardRef.current;
    if (!card) {
      return;
    }
  
    const isInteractiveElement = (e.target as HTMLElement).closest("button");
    if (isInteractiveElement) {
      return;
    }
  
    const rect: DOMRect = card.getBoundingClientRect();
    const x: number = e.clientX - rect.left;
    const y: number = e.clientY - rect.top;
  
    const centerX: number = rect.width / 2;
    const centerY: number = rect.height / 2;
  
    const rotateX: number = -(y - centerY) / 25;
    const rotateY: number = (x - centerX) / 25;
  
    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;
  };
  
  const handleMouseLeave = () => {
    const card: HTMLDivElement | null = cardRef.current;
    if (!card) {
      return;
    }
  
    card.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  };
  
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl p-7 flex flex-col transition-transform duration-300 ease-out will-change-transform ${
        props.plan.featured
          ? "bg-purple-600 border-2 border-purple-400/50 shadow-2xl shadow-purple-900/40"
          : "bg-white/[0.04] border border-white/[0.08]"
      }`}
    >
      {props.plan.featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          Most popular
        </div>
      )}
      <p className={`text-sm font-medium mb-2 ${props.plan.featured ? "text-purple-200" : "text-white/40"}`}>{props.plan.name}</p>
      <p className={`text-4xl font-bold mb-1 tracking-tight ${props.plan.featured ? "text-white" : "text-white"}`}>
        {props.plan.price}
        <span className={`text-sm font-normal ${props.plan.featured ? "text-purple-300" : "text-white/30"}`}>{props.plan.period}</span>
      </p>
      <p className={`text-[13px] mb-6 mt-1 leading-relaxed ${props.plan.featured ? "text-purple-200/80" : "text-white/40"}`}>{props.plan.description}</p>
      <div className="flex-1 space-y-2 mb-6">
        {props.plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={props.plan.featured ? "rgba(255,255,255,0.8)" : "rgba(139,92,246,0.8)"} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className={`text-[13px] ${props.plan.featured ? "text-white/90" : "text-white/55"}`}>{feature}</span>
          </div>
        ))}
      </div>
      <button
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:cursor-pointer ${
          props.plan.featured
            ? "bg-white text-purple-700 hover:bg-purple-50"
            : "bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]"
        }`}
        onClick={()=>props.plan.onClick(props.nav)}
      >
        {props.plan.cta}
      </button>
    </div>
  );
}

export default PricingPlanCard;
