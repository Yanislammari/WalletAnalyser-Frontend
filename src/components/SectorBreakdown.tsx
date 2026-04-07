import type React from "react";
import SectorValue from "./SectorValue";
import type { SectorStat } from "../models/entities/SectorStat";

const sectorsStats: SectorStat[] = [
  { name: "Technology", pct: 37, color: "bg-purple-500" },
  { name: "Healthcare", pct: 21, color: "bg-indigo-400" },
  { name: "Finance", pct: 18, color: "bg-violet-300" },
  { name: "Textile", pct: 14, color: "bg-pink-300" },
  { name: "Other", pct: 10, color: "bg-purple-200" },
];

const SectorBreakdown: React.FC = () => {
  return (
    <div className="bg-gray-50/80 rounded-xl p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Sector exposure</p>
      {sectorsStats.map((sector) => (
        <SectorValue key={sector.name} sector={sector} />
      ))}
    </div>
  );
}

export default SectorBreakdown;
