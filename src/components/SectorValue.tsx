import type React from "react";
import type { SectorStat } from "../models/entities/SectorStat";

interface SectorValueProps {
  sector: SectorStat;
}

const SectorValue: React.FC<SectorValueProps> = (props: SectorValueProps) => {
  return (
    <div key={props.sector.name} className="mb-2.5">
      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
        <span>{props.sector.name}</span>
        <span className="font-medium text-gray-700">{props.sector.pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${props.sector.color}`} style={{ width: `${props.sector.pct}%` }} />
      </div>
    </div>
  );
}

export default SectorValue;
