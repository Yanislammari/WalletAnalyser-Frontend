import type React from "react";
import { HiOutlineArrowUpTray } from "react-icons/hi2";

const SUPPORTED_FORMATS: string[] = [".xlsx", ".csv", ".xls"];

const ImportDataDropzone: React.FC = () => {
  return (
    <div className="bg-white border-2 border-dashed border-purple-200 rounded-2xl p-8 sm:p-16 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
        <HiOutlineArrowUpTray className="w-4 h-4 sm:w-10 sm:h-10 text-purple-600" />
      </div>
      <div className="text-center">
        <p className="text-gray-700 font-semibold text-sm sm:text-base">
          Drop your file here or <span className="text-purple-600">browse</span>
        </p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Supports .xlsx, .csv, .xls — up to 10 MB</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUPPORTED_FORMATS.map((format) => (
          <span key={format} className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] rounded-full font-medium">
            {format}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ImportDataDropzone;
