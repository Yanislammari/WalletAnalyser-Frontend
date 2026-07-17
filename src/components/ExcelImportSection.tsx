import React from "react";
import excelTemplate from "../assets/excel-template.png";
import { FiCheck } from "react-icons/fi";

const features: string[] = [
  "Upload your csv in seconds",
  "Automatic data parsing",
  "Smart categorization",
  "Instant portfolio insights",
];

const ExcelImportSection: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden rounded-2xl py-24 px-10"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8f7ff 40%, #f3f0ff 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-80px] left-[-60px] w-[300px] h-[300px] rounded-full blur-3xl opacity-30"
          style={{ background: "#a78bfa" }}
        />
        <div
          className="absolute bottom-[-100px] right-[-80px] w-[320px] h-[320px] rounded-full blur-3xl opacity-20"
          style={{ background: "#8b5cf6" }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 420"
        >
          <g stroke="#ede9fe" strokeWidth="0.6" opacity="0.6">
            <line x1="200" y1="0" x2="200" y2="420" />
            <line x1="400" y1="0" x2="400" y2="420" />
            <line x1="600" y1="0" x2="600" y2="420" />
            <line x1="0" y1="140" x2="800" y2="140" />
            <line x1="0" y1="280" x2="800" y2="280" />
          </g>
        </svg>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div
            className="rounded-2xl p-3"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(167,139,250,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            <img
              src={excelTemplate}
              alt="Excel preview"
              className="rounded-xl w-full h-auto object-cover"
            />
          </div>
          <div
            className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl opacity-30"
            style={{ background: "#8b5cf6" }}
          />
        </div>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[11px] font-semibold tracking-wider text-violet-700"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            DATA IMPORT
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-indigo-950 mb-5">
            Import your finances.<br />
            <span className="text-violet-600">Instantly structured.</span>
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 mb-8 max-w-md">
            Upload your Excel file and let WalletAnalyser transform raw financial data into clear, actionable insights. No manual entry, no friction — just instant clarity.
          </p>
          <div className="space-y-3 mb-8">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ background: "#8b5cf6" }}
                >
                  <FiCheck />
                </div>
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6">
            {<div>
              <div className="text-2xl font-bold text-violet-600">.csv</div>
              <div className="text-xs text-gray-400">supported</div>
            </div>}
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-violet-600">0 effort</div>
              <div className="text-xs text-gray-400">manual work</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExcelImportSection;
