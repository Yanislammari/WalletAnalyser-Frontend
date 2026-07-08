import type React from "react";
import type { AllocationItem } from "../responses/MetricResponse";

// Palette: purple-ish family matching the app's colour scheme
const BAR_COLORS = [
  "#7c3aed", // purple-600
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a78bfa", // violet-400
  "#c4b5fd", // violet-300
  "#818cf8", // indigo-400
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#fb923c", // orange-400
  "#f472b6", // pink-400
];

const OTHER_COLOR = "#d1d5db"; // gray-300

const OTHER_THRESHOLD_PCT = 5; // items with < 5 % are merged into "Other"
const MAX_SHOWN = 8;           // max named items before "Other" kicks in

interface AllocationBreakdownProps {
  title: string;
  items: AllocationItem[];
  currency: string;
}

const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({ title, items, currency }) => {
  if (items.length === 0) {
    return (
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{title}</p>
        <p className="text-xs text-gray-300 text-center py-6">No data</p>
      </div>
    );
  }

  // Split into main + other
  const sorted = [...items].sort((a, b) => b.allocation - a.allocation);
  const main: AllocationItem[] = [];
  const other: AllocationItem[] = [];

  sorted.forEach((item, idx) => {
    if (idx < MAX_SHOWN && item.allocation >= OTHER_THRESHOLD_PCT) {
      main.push(item);
    } else {
      other.push(item);
    }
  });

  const otherTotal = other.reduce((s, i) => s + i.allocation, 0);
  const otherValue = other.reduce((s, i) => s + i.value, 0);

  const displayed: Array<AllocationItem & { isOther?: boolean }> = [...main];
  if (other.length > 0) {
    displayed.push({ name: `Other (${other.length})`, value: otherValue, allocation: otherTotal, isOther: true });
  }

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2.5">
        {displayed.map((item, i) => {
          const color = item.isOther ? OTHER_COLOR : BAR_COLORS[i % BAR_COLORS.length];
          return (
            <div key={item.name}>
              <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                <span className="truncate max-w-[65%]">{item.name}</span>
                <span className="font-medium text-gray-700 shrink-0 ml-2">
                  {item.allocation.toFixed(1)}%
                  <span className="text-gray-400 font-normal ml-1">· {fmtCurrency(item.value)}</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(item.allocation, 0.5)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllocationBreakdown;
