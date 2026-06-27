import type React from "react";
import type { DmStatUI } from "../models/UI/DmStatUI";

interface DmStatProps {
  stat: DmStatUI;
}

const DmStatCard: React.FC<DmStatProps> = ({ stat }) => {
  return (
    <div className="bg-gray-50/80 rounded-xl p-3.5">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
      <p className={`text-[11px] mt-0.5 ${stat.neutral ? "text-gray-400" : stat.up ? "text-emerald-600" : "text-rose-500"}`}>
        {stat.delta}
      </p>
    </div>
  );
};

export default DmStatCard;
