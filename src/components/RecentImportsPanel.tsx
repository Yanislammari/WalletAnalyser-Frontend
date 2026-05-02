import type React from "react";
import RecentImportItem from "./RecentImportItem";

const RecentImportsPanel: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-4">Recent imports</p>
      <div className="space-y-2">
        {[
          { name: "Q1_2024.xlsx", size: "124 KB", date: "Apr 22, 2026", status: "Processed", statusColor: "text-emerald-600 bg-emerald-50" },
          { name: "Q4_2023.xlsx", size: "98 KB", date: "Jan 15, 2026", status: "Processed", statusColor: "text-emerald-600 bg-emerald-50" },
          { name: "portfolio_backup.csv", size: "42 KB", date: "Dec 3, 2025", status: "Error", statusColor: "text-red-600 bg-red-50" },
        ].map((fileImport) => (
          <RecentImportItem key={fileImport.name} import={fileImport} />
        ))}
      </div>
    </div>
  );
}

export default RecentImportsPanel;
