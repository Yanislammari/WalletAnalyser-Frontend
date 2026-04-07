import type React from "react";
import type { Feature } from "../models/entities/Feature";

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: React.FC<FeatureCardProps> = (props: FeatureCardProps) => {
  return (
    <div className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-200 cursor-pointer">
      <div className="absolute inset-0 rounded-2xl bg-purple-600/0 group-hover:bg-purple-600/5 transition-all duration-300" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
          {props.feature.icon}
        </div>
        <h3 className="text-white font-semibold text-[15px] mb-2">{props.feature.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{props.feature.description}</p>
      </div>
    </div>
  );
}

export default FeatureCard;
