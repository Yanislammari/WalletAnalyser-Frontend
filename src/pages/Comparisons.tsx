import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { HiOutlineChartPie } from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import BenchmarkService, { BENCHMARKS, type BenchmarkMonthlyPoint } from "../services/BenchmarkService";
import type { Portfolio } from "../models/Portfolio";
import type { MetricResponse } from "../responses/MetricResponse";

// ── Constants ─────────────────────────────────────────────────────────────────
const PORTFOLIO_COLORS = ["#7c3aed", "#2563eb", "#0891b2", "#db2777", "#059669", "#d97706"];
const RISK_FREE = 0.04;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtMonth = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1).toLocaleString("en-US", { month: "short", year: "2-digit" });
};
const fmtPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
const fmtNum = (v: number) => v.toFixed(2);

function rebasePortfolio(series: { month: string; cumTwr: number }[], start: string) {
  const map = new Map(series.map((p) => [p.month, p.cumTwr]));
  const baseTwr = map.get(start) ?? series.find((p) => p.month >= start)?.cumTwr ?? 0;
  const baseF = 1 + baseTwr / 100;
  return series
    .filter((p) => p.month >= start)
    .map((p) => ({ month: p.month, value: Math.round(100 * (1 + p.cumTwr / 100) / baseF * 100) / 100 }));
}

function rebaseBenchmark(prices: BenchmarkMonthlyPoint[], start: string) {
  const entry = prices.find((p) => p.month >= start);
  if (!entry) return [];
  const base = entry.price;
  return prices.filter((p) => p.month >= start).map((p) => ({
    month: p.month,
    value: Math.round(100 * p.price / base * 100) / 100,
  }));
}

interface BmStats { totalReturn: number; cagr: number; volatility: number; sharpe: number; maxDrawdown: number }

function computeBmStats(prices: BenchmarkMonthlyPoint[], start: string): BmStats | null {
  const slice = prices.filter((p) => p.month >= start);
  if (slice.length < 3) return null;
  const sp = slice[0].price, ep = slice[slice.length - 1].price, years = slice.length / 12;
  const rets = slice.slice(1).map((p, i) => p.price / slice[i].price - 1);
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const vol  = Math.sqrt(rets.reduce((s, r) => s + (r - mean) ** 2, 0) / Math.max(rets.length - 1, 1)) * Math.sqrt(12) * 100;
  const cagr = (Math.pow(Math.max(ep / sp, 1e-10), 1 / Math.max(years, 0.083)) - 1) * 100;
  let peak = slice[0].price, maxDD = 0;
  for (const { price } of slice) {
    if (price > peak) peak = price;
    const dd = (peak - price) / peak * 100;
    if (dd > maxDD) maxDD = dd;
  }
  return {
    totalReturn: Math.round((ep / sp - 1) * 10000) / 100,
    cagr: Math.round(cagr * 100) / 100,
    volatility: Math.round(vol * 100) / 100,
    sharpe: vol > 0.01 ? Math.round((cagr / 100 - RISK_FREE) / (vol / 100) * 100) / 100 : 0,
    maxDrawdown: Math.round(maxDD * 100) / 100,
  };
}

// ── Chart ─────────────────────────────────────────────────────────────────────

interface ChartSeries { id: string; label: string; color: string; data: { month: string; value: number }[]; dashed?: boolean }

const VW = 900, VH = 420;
const PAD = { left: 58, right: 24, top: 24, bottom: 52 };
const CW = VW - PAD.left - PAD.right;
const CH = VH - PAD.top  - PAD.bottom;

const ComparisonChart: React.FC<{ series: ChartSeries[]; months: string[] }> = ({ series, months }) => {
  const [hover, setHover] = useState<{ x: number; idx: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || months.length < 2) return;
    const rawX = ((e.clientX - rect.left) / rect.width) * VW - PAD.left;
    if (rawX < 0 || rawX > CW) { setHover(null); return; }
    const idx = Math.max(0, Math.min(months.length - 1, Math.round((rawX / CW) * (months.length - 1))));
    setHover({ x: PAD.left + (idx / (months.length - 1)) * CW, idx });
  };

  if (!months.length || !series.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
        <HiOutlineChartPie size={40} />
        <p className="text-sm text-gray-400">Select at least one portfolio to display the chart.</p>
      </div>
    );
  }

  let minV = Infinity, maxV = -Infinity;
  for (const s of series) for (const p of s.data) { if (p.value < minV) minV = p.value; if (p.value > maxV) maxV = p.value; }
  const rng = Math.max(maxV - minV, 1);
  minV -= rng * 0.07; maxV += rng * 0.07;

  const xS = (i: number) => PAD.left + (months.length < 2 ? CW / 2 : (i / (months.length - 1)) * CW);
  const yS = (v: number) => PAD.top + ((maxV - v) / (maxV - minV)) * CH;
  const mIdx = new Map(months.map((m, i) => [m, i]));
  const pts  = (s: ChartSeries) => s.data.filter((p) => mIdx.has(p.month)).map((p) => `${xS(mIdx.get(p.month)!)},${yS(p.value)}`).join(" ");

  const grid     = Array.from({ length: 6 }, (_, i) => minV + i * (maxV - minV) / 5);
  const tickEvery = Math.max(1, Math.ceil(months.length / 10));
  const xTicks    = months.map((m, i) => ({ m, i })).filter(({ i }) => i % tickEvery === 0 || i === months.length - 1);
  const hM = hover !== null ? months[hover.idx] : null;

  return (
    <div className="relative select-none">
      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ userSelect: "none" }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {grid.map((v) => (
          <g key={v.toFixed(1)}>
            <line x1={PAD.left} x2={VW - PAD.right} y1={yS(v)} y2={yS(v)} stroke="#f0f1f5" strokeWidth="1" />
            <text x={PAD.left - 9} y={yS(v) + 4} textAnchor="end" fontSize="12" fill="#bfc5d0">{v.toFixed(0)}</text>
          </g>
        ))}
        {minV < 100 && maxV > 100 && (
          <line x1={PAD.left} x2={VW - PAD.right} y1={yS(100)} y2={yS(100)} stroke="#d8dae0" strokeWidth="1" strokeDasharray="5 3" />
        )}
        {xTicks.map(({ m, i }) => (
          <g key={m}>
            <line x1={xS(i)} x2={xS(i)} y1={PAD.top + CH} y2={PAD.top + CH + 6} stroke="#e5e7eb" />
            <text x={xS(i)} y={PAD.top + CH + 22} textAnchor="middle" fontSize="12" fill="#bfc5d0">{fmtMonth(m)}</text>
          </g>
        ))}
        {series.map((s) => (
          <polyline key={s.id} points={pts(s)} fill="none" stroke={s.color}
            strokeWidth={s.dashed ? 2 : 3}
            strokeDasharray={s.dashed ? "7 4" : undefined}
            strokeLinejoin="round" strokeLinecap="round"
            opacity={hM ? 0.25 : 1} style={{ transition: "opacity 0.1s" }} />
        ))}
        {hM && series.map((s) => (
          <polyline key={s.id + "-hi"} points={pts(s)} fill="none" stroke={s.color}
            strokeWidth={s.dashed ? 2 : 3}
            strokeDasharray={s.dashed ? "7 4" : undefined}
            strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {hover && (
          <line x1={hover.x} x2={hover.x} y1={PAD.top} y2={PAD.top + CH} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
        )}
        {hover && series.map((s) => {
          const p = s.data.find((d) => d.month === hM);
          if (!p) return null;
          return <circle key={s.id + "-d"} cx={hover.x} cy={yS(p.value)} r={5} fill={s.color} stroke="white" strokeWidth="2.5" />;
        })}
      </svg>

      {hover && hM && (
        <div className="pointer-events-none absolute z-20 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 text-sm"
          style={{
            top: 32, minWidth: 180,
            left: `${(hover.x / VW) * 100}%`,
            transform: hover.idx > months.length * 0.6 ? "translateX(-108%)" : "translateX(12px)",
          }}>
          <p className="font-bold text-gray-800 mb-3">{fmtMonth(hM)}</p>
          {series.map((s) => {
            const p = s.data.find((d) => d.month === hM);
            if (!p) return null;
            const d = p.value - 100;
            return (
              <div key={s.id} className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-500 truncate text-xs">{s.label}</span>
                </div>
                <span className={`font-bold text-sm shrink-0 ${d >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {fmtPct(d)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Services ──────────────────────────────────────────────────────────────────
const portfolioService = PortfolioService.getInstance();
const benchmarkService = BenchmarkService.getInstance();

// ── Main ──────────────────────────────────────────────────────────────────────
const ProPaywall: React.FC<{ feature: string }> = ({ feature }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
      <HiOutlineChartPie size={32} className="text-purple-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{feature} is a Pro feature</h2>
    <p className="text-gray-500 text-sm max-w-sm mb-6">
      Upgrade to Pro to unlock benchmark comparisons, full historical analysis, and much more.
    </p>
    <a
      href="/home/subscription"
      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors"
    >
      Upgrade to Pro — €29.99/mo
    </a>
  </div>
);

const Comparisons: React.FC = () => {
  const { user, isPro } = useAuth();
  if (!isPro) return <ProPaywall feature="Comparisons" />;
  const [portfolios,    setPortfolios]    = useState<Portfolio[]>([]);
  const [selectedPfIds, setSelectedPfIds] = useState<string[]>([]);
  const [selectedBmIds, setSelectedBmIds] = useState<string[]>(["^GSPC"]);
  const [metricsMap,    setMetricsMap]    = useState<Map<string, MetricResponse>>(new Map());
  const [benchmarkMap,  setBenchmarkMap]  = useState<Map<string, BenchmarkMonthlyPoint[]>>(new Map());
  const [loadingPf,     setLoadingPf]     = useState<Set<string>>(new Set());
  const [loadingBm,     setLoadingBm]     = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    portfolioService.getAllPortfoliosByUserId(user.id).then(async (pfs) => {
      // Filter out portfolios that have no buys and no sells
      const counts = await Promise.allSettled(
        pfs.map((pf) => portfolioService.getAssetCountByPortfolioId(pf.id))
      );
      const withTransactions = pfs.filter((_, i) => {
        const result = counts[i];
        if (result.status === "rejected") return true; // keep on error
        return result.value.buys > 0 || result.value.sells > 0;
      });
      setPortfolios(withTransactions);
      if (withTransactions.length > 0) setSelectedPfIds([withTransactions[0].id]);
    }).catch(() => {});
  }, [user?.id]);

  const fetchMetrics = useCallback(async (pfId: string) => {
    if (metricsMap.has(pfId) || loadingPf.has(pfId)) return;
    setLoadingPf((s) => new Set(s).add(pfId));
    try { const m = await portfolioService.getMetrics(pfId); setMetricsMap((p) => new Map(p).set(pfId, m)); }
    catch { /* ignore */ }
    finally { setLoadingPf((s) => { const n = new Set(s); n.delete(pfId); return n; }); }
  }, [metricsMap, loadingPf]);

  const fetchBenchmark = useCallback(async (ticker: string, from: string) => {
    if (benchmarkMap.has(ticker) || loadingBm.has(ticker)) return;
    setLoadingBm((s) => new Set(s).add(ticker));
    try { const d = await benchmarkService.getHistory(ticker, from); setBenchmarkMap((p) => new Map(p).set(ticker, d)); }
    catch { /* ignore */ }
    finally { setLoadingBm((s) => { const n = new Set(s); n.delete(ticker); return n; }); }
  }, [benchmarkMap, loadingBm]);

  useEffect(() => { selectedPfIds.forEach(fetchMetrics); }, [selectedPfIds, fetchMetrics]);

  const commonStart = useMemo<string | null>(() => {
    const dates = selectedPfIds.map((id) => metricsMap.get(id)?.firstBuyDate).filter((d): d is string => !!d);
    return dates.length ? dates.reduce((min, d) => (d < min ? d : min)) : null;
  }, [selectedPfIds, metricsMap]);

  useEffect(() => {
    if (!commonStart) return;
    selectedBmIds.forEach((id) => fetchBenchmark(id, commonStart));
  }, [commonStart, selectedBmIds, fetchBenchmark]);

  const { chartSeries, months } = useMemo(() => {
    if (!commonStart) return { chartSeries: [], months: [] };
    const all: ChartSeries[] = [];
    selectedPfIds.forEach((id, idx) => {
      const m = metricsMap.get(id);
      if (!m?.monthlyTwr.length) return;
      const data = rebasePortfolio(m.monthlyTwr, commonStart);
      if (!data.length) return;
      all.push({ id, label: portfolios.find((p) => p.id === id)?.name ?? "Portfolio", color: PORTFOLIO_COLORS[idx % PORTFOLIO_COLORS.length], data, dashed: false });
    });
    selectedBmIds.forEach((ticker) => {
      const prices = benchmarkMap.get(ticker);
      if (!prices?.length) return;
      const bm   = BENCHMARKS.find((b) => b.id === ticker);
      const data = rebaseBenchmark(prices, commonStart);
      if (!data.length) return;
      all.push({ id: ticker, label: bm?.label ?? ticker, color: bm?.color ?? "#9ca3af", data, dashed: true });
    });
    const monthSet = new Set<string>();
    all.forEach((s) => s.data.forEach((p) => monthSet.add(p.month)));
    return { chartSeries: all, months: Array.from(monthSet).sort() };
  }, [selectedPfIds, selectedBmIds, metricsMap, benchmarkMap, commonStart, portfolios]);

  const togglePf = (id: string) => setSelectedPfIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleBm = (id: string) => setSelectedBmIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const pfColumns = selectedPfIds.filter((id) => metricsMap.has(id));
  const bmColumns = selectedBmIds.filter((id) => benchmarkMap.has(id));
  const getBmStats = (ticker: string) => {
    const prices = benchmarkMap.get(ticker);
    return prices && commonStart ? computeBmStats(prices, commonStart) : null;
  };

  // Metric rows definition
  type MetricDef = {
    label: string;
    pf: (m: MetricResponse) => number;
    bm: (s: BmStats) => number;
    fmt: (v: number) => string;
    good: (v: number) => boolean;   // for green/red coloring
    higherIsBetter: boolean;        // for "Best" badge — independent of coloring threshold
    pfOnly?: boolean;
  };

  const METRICS: MetricDef[] = [
    { label: "Total Return",  pf: (m) => m.twr,          bm: (s) => s.totalReturn, fmt: fmtPct,              good: (v) => v >= 0,  higherIsBetter: true  },
    { label: "CAGR",          pf: (m) => m.twrAnnualized, bm: (s) => s.cagr,        fmt: fmtPct,              good: (v) => v >= 0,  higherIsBetter: true  },
    { label: "Volatility",    pf: (m) => m.volatility,   bm: (s) => s.volatility,  fmt: (v) => `${fmtNum(v)}%`, good: (v) => v < 15, higherIsBetter: false },
    { label: "Sharpe Ratio",  pf: (m) => m.sharpeRatio,  bm: (s) => s.sharpe,      fmt: fmtNum,              good: (v) => v > 1,   higherIsBetter: true  },
    { label: "Max Drawdown",  pf: (m) => m.maxDrawdown,  bm: (s) => s.maxDrawdown, fmt: (v) => `-${fmtNum(v)}%`, good: (v) => v < 15, higherIsBetter: false },
    { label: "Sortino Ratio", pf: (m) => m.sortinoRatio, bm: (s) => s.sharpe,      fmt: fmtNum,              good: (v) => v > 1,   higherIsBetter: true,  pfOnly: true },
    { label: "XIRR",          pf: (m) => m.xirrMtm,      bm: (s) => s.cagr,        fmt: fmtPct,              good: (v) => v >= 0,  higherIsBetter: true,  pfOnly: true },
  ];

  return (
    <div className="space-y-4">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Comparisons</h1>
        <p className="text-sm text-gray-400 mt-0.5">Compare portfolios and market benchmarks side by side</p>
      </div>

      {/* ── Selector ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest shrink-0">Portfolios</span>
        <div className="flex flex-wrap gap-1.5">
          {portfolios.map((pf, idx) => {
            const active = selectedPfIds.includes(pf.id);
            const color  = PORTFOLIO_COLORS[selectedPfIds.indexOf(pf.id) % PORTFOLIO_COLORS.length] || PORTFOLIO_COLORS[idx % PORTFOLIO_COLORS.length];
            return (
              <button key={pf.id} onClick={() => togglePf(pf.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer"
                style={active ? { background: color + "15", borderColor: color, color } : { background: "white", borderColor: "#e5e7eb", color: "#9ca3af" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? color : "#d1d5db" }} />
                {pf.name}
              </button>
            );
          })}
        </div>

        <span className="text-gray-200 mx-1 hidden sm:inline">|</span>

        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest shrink-0">Benchmarks</span>
        <div className="flex flex-wrap gap-1.5">
          {BENCHMARKS.map((bm) => {
            const active = selectedBmIds.includes(bm.id);
            return (
              <button key={bm.id} onClick={() => toggleBm(bm.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer"
                style={active ? { background: bm.color + "15", borderColor: bm.color, color: bm.color } : { background: "white", borderColor: "#e5e7eb", color: "#9ca3af" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? bm.color : "#d1d5db" }} />
                {bm.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-4">
            {chartSeries.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <svg width="24" height="12" className="shrink-0">
                  {s.dashed
                    ? <line x1="0" y1="6" x2="24" y2="6" stroke={s.color} strokeWidth="2" strokeDasharray="6 3" />
                    : <line x1="0" y1="6" x2="24" y2="6" stroke={s.color} strokeWidth="3" />}
                </svg>
                <span className="text-xs font-medium text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>
          {commonStart && <span className="text-[11px] text-gray-400">Base 100 · {commonStart}</span>}
        </div>
        <ComparisonChart series={chartSeries} months={months} />
      </div>

      {/* ── Metrics table ──────────────────────────────────────────────────────── */}
      {(pfColumns.length > 0 || bmColumns.length > 0) && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  {/* Sticky metric-name column */}
                  <th className="sticky left-0 bg-white z-10 px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest w-36 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-gray-100" />
                  {pfColumns.map((id) => {
                    const pf    = portfolios.find((p) => p.id === id);
                    const color = PORTFOLIO_COLORS[selectedPfIds.indexOf(id) % PORTFOLIO_COLORS.length];
                    return (
                      <th key={id} className="px-6 py-4 text-left min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                          <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">{pf?.name ?? "Portfolio"}</span>
                        </div>
                      </th>
                    );
                  })}
                  {bmColumns.map((ticker) => {
                    const bm = BENCHMARKS.find((b) => b.id === ticker);
                    return (
                      <th key={ticker} className="px-6 py-4 text-left min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: bm?.color }} />
                          <span className="text-sm font-bold" style={{ color: bm?.color }}>{bm?.label ?? ticker}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((row, ri) => {
                  // Collect all values to find best
                  const allVals: number[] = [
                    ...pfColumns.map((id) => { const m = metricsMap.get(id); return m ? row.pf(m) : null; }).filter((v): v is number => v != null),
                    ...(!row.pfOnly ? bmColumns.map((t) => { const s = getBmStats(t); return s ? row.bm(s) : null; }).filter((v): v is number => v != null) : []),
                  ];
                  const best = allVals.length ? (row.higherIsBetter ? Math.max(...allVals) : Math.min(...allVals)) : null;

                  return (
                    <tr key={row.label} className={`border-b border-gray-50 ${ri % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                      <td className="sticky left-0 bg-inherit z-10 px-5 py-4 text-sm font-semibold text-gray-500 whitespace-nowrap after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-gray-100">
                        {row.label}
                      </td>
                      {pfColumns.map((id) => {
                        const m = metricsMap.get(id);
                        const v = m ? row.pf(m) : null;
                        const isBest = v != null && v === best;
                        return (
                          <td key={id} className="px-6 py-4">
                            {v != null ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-bold ${row.good(v) ? "text-emerald-600" : "text-rose-500"}`}>
                                  {row.fmt(v)}
                                </span>
                                {isBest && allVals.length > 1 && (
                                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Best</span>
                                )}
                              </div>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                        );
                      })}
                      {bmColumns.map((ticker) => {
                        if (row.pfOnly) return <td key={ticker} className="px-6 py-4 text-gray-300 text-sm">—</td>;
                        const s  = getBmStats(ticker);
                        const v  = s ? row.bm(s) : null;
                        const bm = BENCHMARKS.find((b) => b.id === ticker);
                        const isBest = v != null && v === best;
                        return (
                          <td key={ticker} className="px-6 py-4">
                            {v != null ? (
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold" style={{ color: bm?.color }}>
                                  {row.fmt(v)}
                                </span>
                                {isBest && allVals.length > 1 && (
                                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Best</span>
                                )}
                              </div>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparisons;
