import type React from "react";

const LpFooter: React.FC = () => {
  return (
    <footer className="bg-[#080613] border-t border-white/[0.05] px-8 md:px-16 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-lg font-bold tracking-tight text-white">
          Wallet<span className="text-purple-400">Analyser</span>
        </div>
        <p className="text-white/25 text-sm">© 2025 WalletAnalyser. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">Privacy</a>
          <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">Terms</a>
          <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default LpFooter;
