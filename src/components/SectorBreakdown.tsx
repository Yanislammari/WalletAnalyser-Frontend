import type React from "react";

const sectorsStats = [
  { name: "Technology", pct: 38, color: "bg-purple-500" },
  { name: "Healthcare", pct: 22, color: "bg-indigo-400" },
  { name: "Finance", pct: 19, color: "bg-violet-300" },
  { name: "Other", pct: 21, color: "bg-purple-200" },
];

const SectorBreakdown: React.FC = () => {
  return (
    <div className="bg-gray-50/80 rounded-xl p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Sector exposure</p>
      {sectorsStats.map((sector) => (
        <div key={sector.name} className="mb-2.5">
          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
            <span>{sector.name}</span>
            <span className="font-medium text-gray-700">{sector.pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${sector.color}`} style={{ width: `${sector.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SectorBreakdown;
