import type React from "react";

interface MetricBadgeProps {
  metricName: string;
}

const MetricBadge: React.FC<MetricBadgeProps> = (props: MetricBadgeProps) => {
  return (
    <span className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/70 text-[13px] font-medium">
      {props.metricName}
    </span>
  );
}

export default MetricBadge;

