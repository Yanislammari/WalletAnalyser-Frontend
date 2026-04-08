import type React from "react";
import { useNavigate, type NavigateFunction } from "react-router";

const CtaSection: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <section className="relative bg-[#0d0a1a] py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[400px] bg-purple-700/20 blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-14">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
            Built for investors<br />who think long term
          </h2>
          <p className="text-white/50 mb-8 text-[15px] leading-relaxed">
            Stop guessing. Start understanding your portfolio with the depth it deserves.
          </p>
          <button onClick={() => navigate("/main")} className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-xl shadow-purple-900/40 text-[15px] hover:cursor-pointer">
            Create your free account
          </button>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
