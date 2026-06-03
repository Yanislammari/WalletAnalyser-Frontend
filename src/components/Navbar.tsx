import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import SearchBar from "./SearchBar";
import ProfileBlock from "./ProfileBlock";
import ProfileDropdown from "./ProfileDropdown";

const pageTitles: Record<string, string> = {
  "/home/dashboard": "Dashboard",
  "/home/import": "Import Data",
  "/home/portfolio": "Portfolio",
  "/home/badges": "Badges",
  "/home/analysis": "Analysis"
};

const TRANSACTION_RE: RegExp = /^\/home\/portfolio\/([^/]+)\/transactions/;

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const portfolioService = PortfolioService.getInstance();

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [portfolioName, setPortfolioName] = useState<string | null>(null);
  const avatarRef: React.RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement | null>(null);

  const transactionMatch = TRANSACTION_RE.exec(location.pathname);
  const portfolioId = transactionMatch?.[1] ?? null;

  useEffect(() => {
    if (!portfolioId) {
      setPortfolioName(null);
      return;
    }
    portfolioService.getPortfolioById(portfolioId).then((p) => setPortfolioName(p.name)).catch(() => setPortfolioName(null));
  }, [portfolioId]);

  let title: string;
  let subtitle: string;
  if (portfolioId) {
    title = "Portfolio";
    subtitle = portfolioName ? `${portfolioName} / Transactions` : "Transactions";
  }
  else if(location.pathname.includes('badges')){
    title = pageTitles[location.pathname] ?? "Home";
    subtitle = "Your badges";
  }
  else {
    title = pageTitles[location.pathname] ?? "Home";
    subtitle = "Overview";
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <div>
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 sm:px-6 gap-3">
        <button
          onClick={props.onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-gray-900 font-semibold text-[15px] truncate">{title}</h1>
          <span className="text-gray-300 text-sm hidden sm:inline">/</span>
          <span className="text-gray-400 text-sm hidden sm:inline truncate">{subtitle}</span>
        </div>
        <SearchBar />
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-white" />
        </button>
        <ProfileBlock
          user={user}
          onAvatarClick={() => setDropdownOpen((v) => !v)}
          avatarRef={avatarRef}
        />
      </header>
      {dropdownOpen && (
        <ProfileDropdown
          user={user}
          onLogout={handleLogout}
          onClose={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default Navbar;
