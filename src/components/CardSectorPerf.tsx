import { useState } from "react";
import type { RankedAsset } from "../responses/AssetAnalysisResponse";

export interface UserStocksRankingProps {
  onClick : () => void,
  rankAsset: RankedAsset
}

export interface SectorCardDataProps {
  name: string | null;
  perf52w: number | null;
  length : number | null;
  top: PerformerStocksProps[];
  worst: PerformerStocksProps[];
  onClick : () => void
};

export interface PerformerStocksProps {
  name: string | null, 
  perf: number | null
}

const getPerfBg = (perf: number | null) => {
  if(perf == null) return "bg-zinc-50"
  if (perf >= 30)  return "bg-green-200";
  if (perf >= 15)  return "bg-green-100";
  if (perf >= 5)   return "bg-green-50";
  if (perf >= -5)  return "bg-zinc-50";
  if (perf >= -15) return "bg-red-50";
  if (perf >= -30) return "bg-red-100";
  return "bg-red-200";
};

const getPerfText = (perf: number | null) => {
  if(perf == null) return "text-red-700"
  if (perf >= 5)  return "text-green-700";
  if (perf >= -5) return "text-zinc-500";
  return "text-red-700";
};

const fmt = (n: number | null) =>{
  if(n == null) return '-'
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
} 

const PerformerRow = ({ performers }: { performers: PerformerStocksProps[] }) => (
  <div className="flex gap-2">
    {performers.map(p => (
      <div key={p.name} className={`flex-1 rounded-lg px-3 py-2 ${getPerfBg(p.perf)}`}>
        <p className="text-xs font-medium text-zinc-700 truncate">{p.name ? p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name : ""}</p>
        <p className={`text-sm font-semibold mt-0.5 ${getPerfText(p.perf)}`}>
          {fmt(p.perf)}
        </p>
      </div>
    ))}
  </div>
);

const CardSectorPerf = (sector: SectorCardDataProps) => {
  const [open, setOpen] = useState(false);
  const isPositive = (sector?.perf52w ?? 0) >= 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer ${isPositive ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
          <svg
            width="14" height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path d="M2 5l5 5 5-5" stroke={isPositive ? "#15803d" : "#b91c1c"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{sector.name}</p>
          <p className="text-xs text-zinc-400">{sector.length} elements</p>
        </div>
        <span className="text-sm font-semibold text-zinc-900">
          {isPositive ? "+" : ""}{sector?.perf52w ? sector?.perf52w.toFixed(1) : "-"}%
        </span>
      </div>

      {open && (
        <>
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-2">Top performers</p>
            <PerformerRow performers={sector.top} />
          </div>
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-2">Worst performers</p>
            <PerformerRow performers={sector.worst} />
          </div>
          <div className="px-4 py-3 flex justify-end">
            <button
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); sector.onClick()}}
            >
              See more
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSectorPerf