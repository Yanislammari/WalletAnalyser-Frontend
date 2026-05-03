import React from "react";
import type { SortState } from "../models/items/SortState";
import SortIcon from "./SortIcon";

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  sortState: SortState | null;
  onSort: (key: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = (props: SortableHeaderProps) => {
  const isActive: boolean = props.sortState?.key === props.columnKey;

  return (
    <th
      className={`pb-3 pr-4 font-medium select-none whitespace-nowrap group/th ${props.className ?? ""}`}
      onClick={() => props.onSort(props.columnKey)}
    >
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
        isActive
          ? "text-purple-600 bg-purple-50"
          : "hover:bg-gray-100 hover:text-gray-600"
      }`}>
        {props.label}
        <SortIcon columnKey={props.columnKey} sortState={props.sortState} />
      </span>
    </th>
  );
}

export default SortableHeader;
