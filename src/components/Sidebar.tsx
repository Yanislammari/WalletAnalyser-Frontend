import { HiOutlineSquares2X2, HiOutlineArrowDownTray, HiOutlineBriefcase, HiOutlineGift, HiOutlineChartBar, HiOutlineChartPie, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineCreditCard } from "react-icons/hi2";
import type { NavItem } from "../models/items/NavItem";
import { NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import { useAuth } from "../providers/AuthProvider";
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
    to: "/home/comparisons",
    label: "Comparaisons",
    icon: <HiOutlineChartPie size={18} />,
  },
  {
    to: "/home/badges",
    label: "Gift",
    isGift: true,
    icon: <HiOutlineGift size={18} />,
  },
  {
    to: "/home/subscription",
    label: "Subscription",
    icon: <HiOutlineCreditCard size={18} />,
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { selectedPortfolioId } = useSelectedPortfolio();
  const { isPro } = useAuth();

  function getTimeLeft() {
    const raw = localStorage.getItem("user");
    if (!raw) return "No time";
    const user: User = JSON.parse(raw);
    const timeLeftMs = user.timeMsGift;
    if (timeLeftMs == null || isNaN(timeLeftMs)) return "No time";
    const diff = timeLeftMs - Date.now();
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
        fixed left-0 top-0 h-full z-40 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      style={{ background: "#0d0a1a" }}
    >
      {/* Dot background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-purple-600/20 blur-[60px] pointer-events-none" />

      {/* Header: logo + app name + collapse toggle */}
      <div className={`relative z-10 pt-5 pb-7 flex items-center gap-2.5 ${collapsed ? "px-0 flex-col justify-center" : "px-5"}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        {collapsed ? (
          /* Collapsed: chevron sits below the logo, centered */
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <HiOutlineChevronRight size={15} />
          </button>
        ) : (
          <>
            <span className="text-white font-bold text-[15px] tracking-tight flex-1 whitespace-nowrap overflow-hidden">WalletAnalyser</span>
            {/* Collapse toggle — desktop only, next to the title */}
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            >
              <HiOutlineChevronLeft size={15} />
            </button>
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="lg:hidden text-white/40 hover:text-white/80 transition-colors cursor-pointer p-1"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Section label – hidden when collapsed */}
      {!collapsed && (
        <div className="relative z-10 px-6 mb-2">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Menu</p>
        </div>
      )}

      {/* Navigation items */}
      <nav className="relative z-10 flex-1 px-2 space-y-0.5 overflow-hidden">
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
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150
                ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5"}
                ${isActive
                  ? "bg-purple-600/90 text-white shadow-lg shadow-purple-900/40"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
            >
              <span className={isActive ? "text-white" : "text-white/40"}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.isGift &&
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium ml-auto">{timeLeft}</span>
                  }
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Plan card — collapsed: dot indicator */}
      {collapsed ? (
        <div className="relative z-10 flex justify-center pb-5">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${isPro ? "bg-emerald-400" : "bg-white/30"}`}
            title={isPro ? "Pro Plan" : "Free Plan"}
          />
        </div>
      ) : (
        <div className="relative z-10 px-4 pb-6">
          <div className={`rounded-xl border p-4 ${isPro ? "bg-white/[0.04] border-white/[0.06]" : "bg-white/[0.02] border-white/[0.04]"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isPro ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
              <p className="text-[11px] text-white/50 font-medium">{isPro ? "Pro Plan" : "Free Plan"}</p>
            </div>
            {isPro ? (
              <p className="text-[11px] text-white/30 leading-relaxed">All features unlocked.</p>
            ) : (
              <a href="/home/subscription" className="text-[11px] text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Upgrade to Pro →
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
