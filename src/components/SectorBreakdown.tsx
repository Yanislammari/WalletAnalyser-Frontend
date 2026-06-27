import type React from "react";
import type { TopHolding } from "../responses/MetricResponse";

const COLORS = [
  "bg-purple-500",
  "bg-indigo-400",
  "bg-violet-300",
  "bg-pink-300",
  "bg-purple-200",
  "bg-blue-300",
];

interface SectorBreakdownProps {
  holdings: TopHolding[];
}

const SectorBreakdown: React.FC<SectorBreakdownProps> = ({ holdings }) => {
  return (
    <div className="bg-gray-50/80 rounded-xl p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Asset allocation</p>
      {holdings.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-6">No holdings yet</p>
      ) : (
        holdings.map((h, i) => (
          <div key={h.companyName} className="mb-2.5">
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span className="truncate max-w-[70%]">{h.companyName}</span>
              <span className="font-medium text-gray-700">{h.allocation.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                style={{ width: `${Math.max(h.allocation, 1)}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SectorBreakdown;
