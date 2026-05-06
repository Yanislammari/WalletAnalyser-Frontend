import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineChevronDown, HiOutlineXMark, HiBuildingOffice2 } from "react-icons/hi2";
import CompanyLogo from "./CompanyLogo";

interface CompanyFilterProps {
  companies: string[];
  selected: string | null;
  onChange: (company: string | null) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = (props: CompanyFilterProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect: DOMRect = buttonRef.current.getBoundingClientRect();
      
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        zIndex: 9999,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target: Node = e.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target) && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, []);

  const handleToggle = () => {
    if (!open) {
      updatePosition();
    }

    setOpen((prev) => !prev);
  };

  const handleSelect = (company: string | null) => {
    props.onChange(company);
    setOpen(false);
  };

  if (props.companies.length === 0) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border transition-colors cursor-pointer ${
          props.selected
            ? "bg-purple-50 border-purple-200 text-purple-700 font-medium"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
        }`}
      >
        {props.selected
          ? <CompanyLogo name={props.selected} size={20} />
          : <HiBuildingOffice2 size={14} />
        }
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
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-[180px] flex flex-col"
        >
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
          <div className="overflow-y-auto max-h-[300px]">
          {props.companies.map((company) => (
            <button
              key={company}
              onClick={() => handleSelect(company)}
              className={`w-full min-w-0 text-left px-3 py-2 text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                props.selected === company
                  ? "text-purple-700 font-medium bg-purple-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CompanyLogo name={company} size={22} />
              <span className="truncate">{company}</span>
            </button>
          ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default CompanyFilter;
