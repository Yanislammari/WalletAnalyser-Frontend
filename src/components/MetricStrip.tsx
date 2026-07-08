import type React from "react";
import MetricItem from "./MetricItem";
import type { MetricUI } from "../models/UI/MetricUI";
import type { MetricResponse } from "../responses/MetricResponse";

interface MetricStripProps {
  metrics: MetricResponse;
}

const formatPeriod = (firstBuyDate: string | null): string => {
  if (!firstBuyDate) return "—";
  const start     = new Date(firstBuyDate);
  const now       = new Date();
  const totalDays = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  if (totalDays <= 0)  return "Today";
  if (totalDays < 7)   return `${totalDays}d`;
  if (totalDays < 30)  return `${Math.floor(totalDays / 7)}w`;
  if (totalDays < 365) return `${Math.round(totalDays / 30.44)}mo`;
  const y = Math.floor(totalDays / 365.25);
  const m = Math.round((totalDays - Math.floor(y * 365.25)) / 30.44);
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
};

const MetricStrip: React.FC<MetricStripProps> = ({ metrics }) => {
  const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  const fmt    = (v: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: metrics.currencyName,
      maximumFractionDigits: 0,
    }).format(v);

  const items: MetricUI[] = [
    { key: "CAGR",       value: `${fmtPct(metrics.cagr)} / yr` },
    { key: "Volatility", value: `${metrics.volatility.toFixed(1)}%` },
    { key: "Sharpe",     value: metrics.sharpeRatio.toFixed(2) },
    { key: "Div. yield", value: `${metrics.dividendYield.toFixed(1)}%` },
    { key: "Gain",       value: fmtPct(metrics.gainPercent) },
    { key: "Dividends",  value: fmt(metrics.totalDividends) },
    { key: "Returned",   value: fmt(metrics.totalReturned) },
    { key: "Period",     value: formatPeriod(metrics.firstBuyDate) },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-3">
      {items.map(m => <MetricItem key={m.key} metric={m} />)}
    </div>
  );
};

export default MetricStrip;
