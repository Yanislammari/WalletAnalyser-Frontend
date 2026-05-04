import React from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  displayTotal?: number;
}

const Pagination: React.FC<PaginationProps> = (props: PaginationProps) => {
  const shownTotal: number = props.displayTotal ?? props.total;
  const totalPages: number = Math.ceil(props.total / props.pageSize);

  if (props.total === 0) {
    return null;
  }

  const clampedTotalPages: number = Math.max(totalPages, 1);
  const pages: (number | "...")[] = [];

  if (clampedTotalPages <= 7) {
    for (let i = 1; i <= clampedTotalPages; i++) {
      pages.push(i);
    }
  }
  else {
    pages.push(1);
    if (props.page > 3) {
      pages.push("...");
    }

    const start: number = Math.max(2, props.page - 1);
    const end: number = Math.min(clampedTotalPages - 1, props.page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (props.page < clampedTotalPages - 2) {
      pages.push("...");
    }

    pages.push(clampedTotalPages);
  }

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">{shownTotal} result{shownTotal !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-1">
      <button
        onClick={() => props.onChange(props.page - 1)}
        disabled={props.page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <HiOutlineChevronLeft size={15} />
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => props.onChange(page as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              page === props.page
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => props.onChange(props.page + 1)}
        disabled={props.page === clampedTotalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <HiOutlineChevronRight size={15} />
      </button>
      </div>
    </div>
  );
}

export default Pagination;
