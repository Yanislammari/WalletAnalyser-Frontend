import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineCalendarDays, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { inputCls } from "../constants/transactionConstants";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  portalTarget?: HTMLElement | null;
}

const MONTHS: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const parseLocalDate = (str: string): Date | null => {
  if (!str) {
    return null;
  }

  const [year, month, day]: number[] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toYMD = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, "0");
  const day: string = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const DateInput: React.FC<DateInputProps> = (props: DateInputProps) => {
  const today: Date = new Date();
  const [open, setOpen] = useState<boolean>(false);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected: Date | null = parseLocalDate(props.value);

  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = () => {
    if (containerRef.current) {
      const rect: DOMRect = containerRef.current.getBoundingClientRect();
      const CALENDAR_HEIGHT: number = 340;
      const spaceBelow: number = window.innerHeight - rect.bottom;
      const top: number = spaceBelow >= CALENDAR_HEIGHT || spaceBelow >= rect.top ? rect.bottom + 6 : rect.top - CALENDAR_HEIGHT - 6;

      setDropdownStyle({ position: "fixed", top, left: rect.left, width: 288 });
    }

    const baseDate: Date = selected ?? today;
    setViewYear(baseDate.getFullYear());
    setViewMonth(baseDate.getMonth());
    setOpen((open) => !open);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    }
    else {
      setViewMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    const isCurrentMonth: boolean = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) {
      return;
    }
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    }
    else {
      setViewMonth((month) => month + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const date: Date = new Date(viewYear, viewMonth, day);
    if (date > today) {
      return;
    }

    props.onChange(toYMD(date));
    setOpen(false);
  };

  const onClickToday = () => {
    props.onChange(toYMD(today));
    setOpen(false);
  };

  const daysInMonth: number = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirstDay: number = new Date(viewYear, viewMonth, 1).getDay();
  const firstDay: number = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const isCurrentMonth: boolean = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={handleOpen}
        className={`${inputCls} flex items-center justify-between cursor-pointer select-none`}
      >
        <span className={props.value ? "text-gray-900" : "text-gray-400"}>
          {selected ? formatDisplay(selected) : "Select a date"}
        </span>
        <HiOutlineCalendarDays size={16} className="text-gray-400 shrink-0 ml-2" />
      </div>
      {open && createPortal(
        <div ref={dropdownRef} data-date-picker-portal="true" style={dropdownStyle} className="z-[9999] bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <HiOutlineChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isCurrentMonth
                  ? "text-gray-200 cursor-not-allowed"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer"
              }`}
            >
              <HiOutlineChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-medium text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day: number = index + 1;
              const date: Date = new Date(viewYear, viewMonth, day);
              const isFuture: boolean = date > today;
              const isToday: boolean = date.getTime() === today.getTime();
              const isSelected: boolean | null = selected && date.getTime() === selected.getTime();

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    h-8 w-full rounded-lg text-xs font-medium transition-colors
                    ${isSelected
                      ? "bg-purple-600 text-white"
                      : isFuture
                      ? "text-gray-200 cursor-not-allowed"
                      : isToday
                      ? "text-purple-600 font-bold hover:bg-purple-50 cursor-pointer"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600 cursor-pointer"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 flex justify-center">
            <button
              type="button"
              onClick={() => onClickToday()}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors"
            >
              Today
            </button>
          </div>
        </div>,
        props.portalTarget ?? document.body
      )}
    </div>
  );
}

export default DateInput;
