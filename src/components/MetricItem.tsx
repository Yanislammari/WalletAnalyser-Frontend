import type React from "react";
import type { MetricUI } from "../models/UI/MetricUI";

interface MetricItemProps {
  metric: MetricUI;
}

const MetricItem: React.FC<MetricItemProps> = (props: MetricItemProps) => {
  return (
    <div className="bg-purple-50/60 border border-purple-100/60 rounded-lg p-2 text-center">
      <p className="text-[9px] text-gray-400 uppercase tracking-wide">{props.metric.key}</p>
      <p className="text-[13px] font-semibold text-purple-700 mt-0.5">{props.metric.value}</p>
    </div>
  );
}

export default MetricItem;
