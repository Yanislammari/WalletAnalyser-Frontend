import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineCalendarDays, HiOutlineXMark } from "react-icons/hi2";
import DateInput from "./DateInput";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = (props: DateRangeFilterProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isActive: boolean = !!props.from || !!props.to;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
    setOpen((prev) => !prev);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onFromChange("");
    props.onToChange("");
  };

  const label = (): string => {
    if (props.from && props.to) {
      return `${props.from} → ${props.to}`;
    }
    if (props.from) {
      return `From ${props.from}`;
    }
    if (props.to) {
      return `Until ${props.to}`;
    }
    return "Date range";
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border transition-colors cursor-pointer ${
          isActive
            ? "bg-purple-50 border-purple-200 text-purple-700 font-medium"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
        }`}
      >
        <HiOutlineCalendarDays size={14} />
        <span className="max-w-[160px] truncate">{label()}</span>
        {isActive && (
          <span
            onClick={handleClear}
            className="ml-1 text-purple-400 hover:text-purple-700 transition-colors"
          >
            <HiOutlineXMark size={14} />
          </span>
        )}
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className="bg-white border border-gray-100 rounded-2xl shadow-lg p-4 min-w-[300px]"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Date range</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">From</label>
              <DateInput value={props.from} onChange={props.onFromChange} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">To</label>
              <DateInput value={props.to} onChange={props.onToChange} />
            </div>
          </div>
          {isActive && (
            <button
              onClick={handleClear}
              className="mt-3 w-full text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default DateRangeFilter;
