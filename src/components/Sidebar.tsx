import { HiOutlineSquares2X2, HiOutlineArrowDownTray, HiOutlineBriefcase, HiOutlineGift, HiOutlineChartBar } from "react-icons/hi2";
import type { NavItem } from "../models/items/NavItem";
import { NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import type { User } from "../models/User";
import { HiOutlineSearch } from "react-icons/hi";

const NAV_ITEMS: NavItem[] = [
  {
    to: "/home/dashboard",
    label: "Dashboard",
    icon: <HiOutlineSquares2X2 size={18} />,
  },
  {
    to: "/home/portfolio",
    label: "Portfolios",
    icon: <HiOutlineBriefcase size={18} />,
  },
  {
    to: "/home/metrics",
    label: "Metrics",
    icon: <HiOutlineChartBar size={18} />,
  },
  {
    to: "/home/import",
    label: "Import Data",
    icon: <HiOutlineArrowDownTray size={18} />,
  },
  {
    to: "/home/analysis",
    label: "Analysis",
    icon: <HiOutlineSearch size={18} />,
  },
  {
    to: "/home/badges",
    label: "Gift",
    isGift: true,
    icon: <HiOutlineGift size={18} />,
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
  const location = useLocation();
  const { selectedPortfolioId } = useSelectedPortfolio();

  function getTimeLeft() {
    const raw = localStorage.getItem("user");
    if (!raw) return "No time";
    const user: User = JSON.parse(raw);
    const timeLeftMs = user.timeMsGift;
    if (timeLeftMs == null || isNaN(timeLeftMs)) return "No time";
    const diff = timeLeftMs - Date.now()
    if (diff <= 0) return "Available now";

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full w-64 z-40 flex flex-col
        transition-transform duration-300 ease-in-out
        ${props.isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      style={{ background: "#0d0a1a" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-purple-600/20 blur-[60px] pointer-events-none" />
      <div className="relative z-10 px-5 pt-5 pb-7 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight flex-1">WalletAnalyser</span>
        <button
          onClick={props.onClose}
          className="lg:hidden text-white/40 hover:text-white/80 transition-colors cursor-pointer p-1"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="relative z-10 px-6 mb-2">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Menu</p>
      </div>
      <nav className="relative z-10 flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isPortfolio = item.to === "/home/portfolio";
          const to = isPortfolio && selectedPortfolioId
            ? `/home/portfolio/${selectedPortfolioId}/transactions`
            : item.to;
          const isActive = isPortfolio
            ? location.pathname.startsWith("/home/portfolio")
            : location.pathname === item.to || location.pathname.startsWith(item.to + "/");

          return (
            <NavLink
              key={item.to}
              to={to}
              onClick={props.onClose}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-purple-600/90 text-white shadow-lg shadow-purple-900/40"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className={isActive ? "text-white" : "text-white/40"}>{item.icon}</span>
              {item.label}
              {item.isGift &&
                <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium ml-auto">{timeLeft}</span>
              }
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </NavLink>
          );
        })}
      </nav>
      <div className="relative z-10 px-4 pb-6">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] text-white/50 font-medium">Pro Plan</p>
          </div>
          <p className="text-[11px] text-white/30 leading-relaxed">All features unlocked. Next renewal in 28 days.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
