import type React from "react";
import LpNavbar from "./LpNavbar";
import DashboardMockup from "./DashboardMockup";
import { useNavigate, type NavigateFunction } from "react-router";

const HeroBanner: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      <div className="absolute -top-[20%] -right-[10%] w-[900px] h-[900px] rounded-full bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-indigo-400/20 via-purple-400/20 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg className="absolute top-0 right-0 h-full w-[60%]" viewBox="0 0 500 1000" preserveAspectRatio="none">
          <path d="M0,0 Q400,400 200,1000 L500,1000 L500,0 Z" fill="rgba(139,92,246,0.07)" />
        </svg>
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <LpNavbar />
      <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center px-6 pt-8 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-medium tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Portfolio analytics, redefined
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.06] mb-6 max-w-3xl">
          Know exactly where<br />
          your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">money stands</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-10">
          Import your portfolio, track performance, compare against benchmarks — and understand every metric that matters.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mb-20">
          <button onClick={() => navigate("/main")} className="px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-200 cursor-pointer">
            Start for free
          </button>
          <button className="px-7 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
            See a demo
          </button>
        </div>
        <DashboardMockup />
      </div>
    </section>
  );
}

export default HeroBanner;
