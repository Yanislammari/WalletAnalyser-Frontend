import type React from "react";

interface RecentImportItemProps {
  import: any; // TODO: Define a type for the imports
}

const RecentImportItem: React.FC<RecentImportItemProps> = (props: RecentImportItemProps) => {
  return (
    <div key={props.import.name} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
        <svg className="w-[18px] h-[18px] text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{props.import.name}</p>
        <p className="text-[11px] text-gray-400">{props.import.size} · <span className="hidden sm:inline">{props.import.date}</span></p>
      </div>
      <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full shrink-0 ${props.import.statusColor}`}>{props.import.status}</span>
    </div>
  );
}

export default RecentImportItem;
