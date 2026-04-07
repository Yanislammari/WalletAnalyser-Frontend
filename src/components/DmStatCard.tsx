import type React from "react";
import type { DmStat } from "../models/entities/DmStat";

interface DmStatProps {
  stat: DmStat;
}

const DmStatCard: React.FC<DmStatProps> = (props: DmStatProps) => {
  return (
    <div className="bg-gray-50/80 rounded-xl p-3.5">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{props.stat.label}</p>
      <p className="text-xl font-bold text-gray-900">{props.stat.value}</p>
      <p className="text-[11px] text-emerald-600 mt-0.5">{props.stat.delta}</p>
    </div>
  );
}

export default DmStatCard;
