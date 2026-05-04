import React from "react";
import { HiOutlinePlus, HiOutlineFunnel } from "react-icons/hi2";

interface EmptyTableProps {
  onAdd: () => void;
  label: string;
  filtered?: boolean;
  selectedCompany?: string | null;
  dateFiltered?: boolean;
}

const EmptyTable: React.FC<EmptyTableProps> = (props: EmptyTableProps) => {
  if (props.filtered || props.dateFiltered) {
    const subtitle = props.selectedCompany
      ? `No results for "${props.selectedCompany}"`
      : "Try adjusting your filters";

    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <HiOutlineFunnel className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-gray-600 font-medium text-sm">No {props.label} match your filters</p>
          <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
        <HiOutlinePlus className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-gray-600 font-medium text-sm">No {props.label} yet</p>
        <p className="text-gray-400 text-xs mt-0.5">Click + to add a row</p>
      </div>
      <button
        onClick={props.onAdd}
        className="flex items-center gap-1.5 px-4 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl font-medium transition-colors cursor-pointer"
      >
        <HiOutlinePlus size={15} /> Add
      </button>
    </div>
  );
}

export default EmptyTable;
