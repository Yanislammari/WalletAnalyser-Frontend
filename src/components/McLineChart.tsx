import type React from "react";

const McLineChart: React.FC = () => {
  return (
    <svg viewBox="0 0 400 100" className="w-full h-24 mb-5" preserveAspectRatio="none">
      <defs>
        <linearGradient id="yourGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points="0,85 50,78 100,82 150,65 200,72 250,58 300,63 350,50 400,42"
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"
        strokeLinejoin="round" strokeLinecap="round"
      />
      <path d="M0,100 L0,85 50,72 100,78 150,58 200,62 250,45 300,50 350,35 400,20 L400,100 Z" fill="url(#yourGrad)" />
      <polyline
        points="0,85 50,72 100,78 150,58 200,62 250,45 300,50 350,35 400,20"
        fill="none" stroke="#7c3aed" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}

export default McLineChart;
