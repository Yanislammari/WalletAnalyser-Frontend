import React, { useState, useRef, useEffect } from "react";
import { HiOutlineBriefcase, HiOutlineChevronDown, HiOutlineCheck } from "react-icons/hi2";
import { getPortfolioColor } from "../utils/Colors";
import type { Portfolio } from "../models/Portfolio";

interface PortfolioSelectProps {
  portfolios: Portfolio[];
  selectedId: string;
  onChange: (id: string) => void;
}

const PortfolioSelect: React.FC<PortfolioSelectProps> = ({ portfolios, selectedId, onChange }) => {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = portfolios.find((p) => p.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        type="button"
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer shadow-sm min-w-[160px]"
      >
        {selected ? (
          <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${getPortfolioColor(selected.id)} flex items-center justify-center flex-shrink-0`}>
            <HiOutlineBriefcase className="w-3 h-3 text-white" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <HiOutlineBriefcase className="w-3 h-3 text-gray-400" />
          </div>
        )}
        <span className="font-medium flex-1 text-left truncate max-w-[140px]">
          {selected?.name ?? "Select a portfolio"}
        </span>
        <HiOutlineChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-gray-100 rounded-xl shadow-xl w-60 py-1.5 overflow-hidden">
          {portfolios.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No portfolios found</p>
          ) : (
            portfolios.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onChange(p.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                  p.id === selectedId ? "bg-purple-50" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getPortfolioColor(p.id)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <HiOutlineBriefcase className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`truncate font-medium leading-tight ${p.id === selectedId ? "text-purple-700" : "text-gray-700"}`}>
                    {p.name}
                  </p>
                  {p.displayCurrencyName && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.displayCurrencyName}</p>
                  )}
                </div>
                {p.id === selectedId && (
                  <HiOutlineCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioSelect;
