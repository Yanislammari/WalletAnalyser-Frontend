import React, { useEffect, useRef, useState } from "react";
import { HiOutlineChevronDown, HiOutlineXMark, HiBuildingOffice2 } from "react-icons/hi2";

interface CompanyFilterProps {
  companies: string[];
  selected: string | null;
  onChange: (company: string | null) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = (props: CompanyFilterProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (company: string | null) => {
    props.onChange(company);
    setOpen(false);
  };

  if (props.companies.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border transition-colors cursor-pointer ${
          props.selected
            ? "bg-purple-50 border-purple-200 text-purple-700 font-medium"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
        }`}
      >
        <HiBuildingOffice2 size={14} />
        <span>{props.selected ?? "All companies"}</span>
        {props.selected ? (
          <span
            onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
            className="ml-1 text-purple-400 hover:text-purple-700 transition-colors"
          >
            <HiOutlineXMark size={14} />
          </span>
        ) : (
          <HiOutlineChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[180px]">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
              props.selected === null
                ? "text-purple-700 font-medium bg-purple-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All companies
          </button>
          <div className="my-1 border-t border-gray-100" />
          {props.companies.map((company) => (
            <button
              key={company}
              onClick={() => handleSelect(company)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer truncate ${
                props.selected === company
                  ? "text-purple-700 font-medium bg-purple-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {company}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyFilter;
