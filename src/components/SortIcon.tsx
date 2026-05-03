import type React from "react";
import type { SortState } from "../models/items/SortState";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi2";
import { SortDir } from "../enums/SortDir";

interface SortIconProps {
  columnKey: string;
  sortState: SortState | null;
}

const SortIcon: React.FC<SortIconProps> = (props: SortIconProps) => {
  if (props.sortState?.key !== props.columnKey) {
    return (
      <span className="inline-flex flex-col gap-[1px] opacity-0 group-hover/th:opacity-40 transition-opacity ml-1 align-middle">
        <HiOutlineArrowUp size={9} />
        <HiOutlineArrowDown size={9} />
      </span>
    );
  }
  return props.sortState.dir === SortDir.ASC
    ? <HiOutlineArrowUp size={11} className="inline ml-1 align-middle text-purple-500" />
    : <HiOutlineArrowDown size={11} className="inline ml-1 align-middle text-purple-500" />;
};

export default SortIcon;
