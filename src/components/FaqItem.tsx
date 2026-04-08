import React, { useState } from "react";
import type { FaqUI } from "../models/UI/FaqUI";

interface FaqItemProps {
  faq: FaqUI;
}

const FaqItem: React.FC<FaqItemProps> = (props: FaqItemProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="group relative border-b border-white/10 overflow-hidden">
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      </span>
      <button
        className="relative z-10 w-full text-left flex justify-between items-center py-5 text-white/90 font-medium text-[15px] group-hover:text-white transition-colors hover:cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>{props.faq.question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p className="relative z-10 text-white/55 text-[14px] leading-relaxed pb-5 -mt-1 group-hover:text-white/70 transition-colors">
          {props.faq.awnser}
        </p>
      )}
    </div>
  );
}

export default FaqItem;
