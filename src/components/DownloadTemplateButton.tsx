import type React from "react";
import type { TemplateFormatUI } from "../models/UI/TemplateFormatUI";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import type { Format } from "../enums/Format";

interface DownloadTemplateButtonProps {
  templateFormat: TemplateFormatUI;
  isLoading: boolean;
  downloadingFormat: string | null;
  handleDownloadTemplate: (format: Format) => void;
}

const DownloadTemplateButton: React.FC<DownloadTemplateButtonProps> = (props: DownloadTemplateButtonProps) => {
  return (
    <button
      onClick={() => props.handleDownloadTemplate(props.templateFormat.dl)}
      disabled={!!props.downloadingFormat}
      className={`flex flex-col items-center justify-center gap-2 py-5 transition-colors cursor-pointer ${props.templateFormat.hover} group disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <div className={`w-9 h-9 rounded-xl ${props.templateFormat.bg} flex items-center justify-center ${!props.downloadingFormat ? "group-hover:scale-110" : ""} transition-transform`}>
        {props.isLoading ? (
          <svg className={`w-4 h-4 animate-spin ${props.templateFormat.color}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <HiOutlineArrowDownTray size={17} className={props.templateFormat.color} />
        )}
      </div>
      <div className="text-center">
        <p className={`text-xs font-bold ${props.templateFormat.color}`}>{props.templateFormat.format}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{props.templateFormat.ext}</p>
      </div>
    </button>
  );
}

export default DownloadTemplateButton;
