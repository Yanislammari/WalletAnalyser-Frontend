import type React from "react";
import MetricItem from "./MetricItem";
import type { MetricUI } from "../models/UI/MetricUI";

const metrics: MetricUI[] = [
  { key: "TWR", value: "+14.7%" },
  { key: "CAGR", value: "8.2%" },
  { key: "Sortino", value: "1.87" },
  { key: "XIRR", value: "9.1%" },
  { key: "Max DD", value: "-14.3%" },
  { key: "Log ret.", value: "7.8%" },
  { key: "MWRR", value: "8.6%" },
  { key: "Volatility", value: "11.2%" },
];

const MetricStrip: React.FC = () => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-3">
      {metrics.map((metric) => (
        <MetricItem key={metric.key} metric={metric} />
      ))}
    </div>
  );
}

export default MetricStrip;
