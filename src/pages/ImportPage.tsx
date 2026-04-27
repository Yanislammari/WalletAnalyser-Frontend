import type React from "react";

const ImportPage: React.FC = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-xl font-bold tracking-tight">Import Data</h2>
        <p className="text-gray-500 text-sm mt-0.5">Upload your portfolio file to get started.</p>
      </div>

      {/* Drop zone */}
      <div className="bg-white border-2 border-dashed border-purple-200 rounded-2xl p-8 sm:p-16 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v13m0 0l-4-4m4 4l4-4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Drop your file here or <span className="text-purple-600">browse</span>
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Supports .xlsx, .csv, .xls — up to 10 MB</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["Excel", "CSV", "Brokerage export"].map((f) => (
            <span key={f} className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] rounded-full font-medium">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Recent imports */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-4">Recent imports</p>
        <div className="space-y-2">
          {[
            { name: "Q1_2024.xlsx", size: "124 KB", date: "Apr 22, 2026", status: "Processed", statusColor: "text-emerald-600 bg-emerald-50" },
            { name: "Q4_2023.xlsx", size: "98 KB", date: "Jan 15, 2026", status: "Processed", statusColor: "text-emerald-600 bg-emerald-50" },
            { name: "portfolio_backup.csv", size: "42 KB", date: "Dec 3, 2025", status: "Error", statusColor: "text-red-600 bg-red-50" },
          ].map((file) => (
            <div key={file.name} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-[18px] h-[18px] text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-[11px] text-gray-400">{file.size} · <span className="hidden sm:inline">{file.date}</span></p>
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full shrink-0 ${file.statusColor}`}>{file.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
