import type React from "react";
import type { CompareRow } from "../models/entities/CompareRow";

interface CompareRowMetricsProps {
  row: CompareRow;
}

const CompareRowMetrics: React.FC<CompareRowMetricsProps> = (props: CompareRowMetricsProps) => {
  return (
    <div className="flex items-center py-2 border-b border-white/[0.04]">
      <span className="flex-1 text-[13px] text-white/50">{props.row.label}</span>
      <span className="w-20 text-right text-[13px] font-semibold text-emerald-400">{props.row.yours}</span>
      <span className="w-20 text-right text-[13px] text-white/30">{props.row.bench}</span>
    </div>
  );
}

export default CompareRowMetrics;
