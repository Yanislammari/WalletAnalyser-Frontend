import React, { useState, useMemo } from "react";
import type { MonthlyDataPoint } from "../responses/MetricResponse";

const PERIODS = ["3M", "6M", "1Y", "All"] as const;
type Period = typeof PERIODS[number];
const PERIOD_MONTHS: Record<Period, number | null> = { "3M": 3, "6M": 6, "1Y": 12, "All": null };

interface DmLineChartProps {
  data: MonthlyDataPoint[];
  currency: string;
}

const DmLineChart: React.FC<DmLineChartProps> = ({ data, currency }) => {
  const [period, setPeriod]   = useState<Period>("1Y");
  const [hovered, setHovered] = useState<number | null>(null);

  const sliced = useMemo(() => {
    const n = PERIOD_MONTHS[period];
    return n ? data.slice(-n) : data;
  }, [data, period]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  const fmtShort = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
    return v.toFixed(0);
  };

  const fmtMonth = (key: string) => {
    const [y, m] = key.split("-");
    const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${names[Number(m) - 1]} ${y.slice(2)}`;
  };

  if (sliced.length < 2) {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Portfolio value over time</p>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-2 py-1 text-[11px] rounded-lg font-medium cursor-pointer transition-colors ${
                  period === p ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center h-28 text-xs text-gray-300">
          Not enough data for this period
        </div>
      </>
    );
  }

  const W = 400, H = 112, totalH = 140;
  const PAD = { left: 38, right: 8, top: 8, bottom: 24 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  // Portfolio value = invested + netGain (cumulative returns at each month)
  const portfolioVals = sliced.map(d => d.invested + d.netGain);
  const investedVals  = sliced.map(d => d.invested);
  const allVals       = [...portfolioVals, ...investedVals];
  const minV          = Math.min(...allVals);
  const maxV          = Math.max(...allVals);
  const range         = maxV - minV || 1;
  const pad           = range * 0.1;

  const toX = (i: number) => PAD.left + (i / (sliced.length - 1)) * cW;
  const toY = (v: number) => PAD.top + cH - ((v - (minV - pad)) / (range + 2 * pad)) * cH;

  const pCoords: [number, number][] = portfolioVals.map((v, i) => [toX(i), toY(v)]);
  const iCoords: [number, number][] = investedVals.map((v, i)  => [toX(i), toY(v)]);

  const ptStr = (cs: [number, number][]) => cs.map(([x, y]) => `${x},${y}`).join(" ");

  const areaPath = [
    `M${pCoords[0][0]},${pCoords[0][1]}`,
    ...pCoords.slice(1).map(([x, y]) => `L${x},${y}`),
    `L${pCoords[pCoords.length - 1][0]},${PAD.top + cH}`,
    `L${pCoords[0][0]},${PAD.top + cH}`,
    "Z",
  ].join(" ");

  const lastGain  = sliced[sliced.length - 1].netGain;
  const lineColor = lastGain >= 0 ? "#7c3aed" : "#f43f5e";

  // Y axis: 3 ticks
  const yTicks = [minV, (minV + maxV) / 2, maxV];

  // X labels: at most 5, evenly spaced
  const xStep    = Math.max(1, Math.floor((sliced.length - 1) / 4));
  const xIdxSet  = new Set<number>([0, sliced.length - 1]);
  for (let i = xStep; i < sliced.length - 1; i += xStep) xIdxSet.add(i);

  const h = hovered;

  return (
    <>
      {/* Header with period buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Portfolio value over time</p>
          {h !== null && (
            <p className="text-[11px] text-gray-600 font-semibold mt-0.5">
              {fmtMonth(sliced[h].month)} &nbsp;·&nbsp;
              {fmt(sliced[h].invested + sliced[h].netGain)}
              <span className={`ml-1.5 ${sliced[h].netGain >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                ({sliced[h].netGain >= 0 ? "+" : ""}{fmt(sliced[h].netGain)})
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => { setPeriod(p); setHovered(null); }}
              className={`px-2 py-1 text-[11px] rounded-lg font-medium cursor-pointer transition-colors ${
                period === p ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${W} ${totalH}`}
        className="w-full"
        style={{ userSelect: "none" }}
        onMouseMove={e => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const xRel = ((e.clientX - rect.left) / rect.width) * W;
          const raw  = (xRel - PAD.left) / cW * (sliced.length - 1);
          setHovered(Math.max(0, Math.min(sliced.length - 1, Math.round(raw))));
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + Y labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={PAD.left - 4} y={toY(v) + 3.5} fontSize="9" fill="#d1d5db" textAnchor="end" fontFamily="sans-serif">
              {fmtShort(v)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Cost basis (dashed) */}
        <polyline points={ptStr(iCoords)} fill="none" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round" />

        {/* Portfolio value line */}
        <polyline points={ptStr(pCoords)} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Last point dot */}
        <circle cx={pCoords[pCoords.length - 1][0]} cy={pCoords[pCoords.length - 1][1]} r="4" fill={lineColor} />

        {/* X labels */}
        {sliced.map((d, i) => !xIdxSet.has(i) ? null : (
          <text key={i} x={toX(i)} y={totalH - 6} fontSize="9" fill="#9ca3af" textAnchor="middle" fontFamily="sans-serif">
            {fmtMonth(d.month)}
          </text>
        ))}

        {/* Hover indicator */}
        {h !== null && (
          <>
            <line x1={toX(h)} x2={toX(h)} y1={PAD.top} y2={PAD.top + cH} stroke={lineColor} strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
            <circle cx={pCoords[h][0]} cy={pCoords[h][1]} r="4" fill={lineColor} />
            <circle cx={iCoords[h][0]} cy={iCoords[h][1]} r="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 rounded" style={{ backgroundColor: lineColor }} />
          <span className="text-[9px] text-gray-400">Net returns</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="18" height="5"><line x1="0" y1="2.5" x2="18" y2="2.5" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
          <span className="text-[9px] text-gray-400">Cost basis</span>
        </div>
      </div>
    </>
  );
};

export default DmLineChart;
