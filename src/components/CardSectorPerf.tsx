import { useState } from "react";

type Performer = { name: string, perf: number };

export type ClusterCardData = {
  clusterName: string;
  perf52w: number;
  top: Performer[];
  worst: Performer[];
};

export type ClusterProps = {
  props : ClusterCardData
}

const getPerfBg = (perf: number) => {
  if (perf >= 30)  return "bg-green-200";
  if (perf >= 15)  return "bg-green-100";
  if (perf >= 5)   return "bg-green-50";
  if (perf >= -5)  return "bg-zinc-50";
  if (perf >= -15) return "bg-red-50";
  if (perf >= -30) return "bg-red-100";
  return "bg-red-200";
};

const getPerfText = (perf: number) => {
  if (perf >= 5)  return "text-green-700";
  if (perf >= -5) return "text-zinc-500";
  return "text-red-700";
};

const fmt = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

const PerformerRow = ({ performers }: { performers: Performer[] }) => (
  <div className="flex gap-2">
    {performers.map(p => (
      <div key={p.name} className={`flex-1 rounded-lg px-3 py-2 ${getPerfBg(p.perf)}`}>
        <p className="text-xs font-medium text-zinc-700 truncate">{p.name}</p>
        <p className={`text-sm font-semibold mt-0.5 ${getPerfText(p.perf)}`}>
          {fmt(p.perf)}
        </p>
      </div>
    ))}
  </div>
);

const CardSectorPerf = (cluster: ClusterCardData) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer ${cluster.perf52w >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cluster.perf52w >= 0 ? "bg-green-100" : "bg-red-100"}`}>
          <svg
            width="14" height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path d="M2 5l5 5 5-5" stroke={cluster.perf52w >= 0 ? "#15803d" : "#b91c1c"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{cluster.clusterName}</p>
          <p className="text-xs text-zinc-400">Cluster</p>
        </div>
        <span className="text-sm font-semibold text-zinc-900">
          {cluster.perf52w >= 0 ? "+" : ""}{cluster.perf52w.toFixed(1)}%
        </span>
      </div>

      {open && (
        <>
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-2">Top performers</p>
            <PerformerRow performers={cluster.top} />
          </div>
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-2">Worst performers</p>
            <PerformerRow performers={cluster.worst} />
          </div>
          <div className="px-4 py-3 flex justify-end">
            <button
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); /* navigate */ }}
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