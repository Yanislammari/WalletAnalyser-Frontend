import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import ProfileBlock from "./ProfileBlock";
import ProfileDropdown from "./ProfileDropdown";
import PortfolioSelect from "./PortfolioSelect";
import ProfileModal from "./ProfileModal";
import SettingsModal from "./SettingsModal";
import HelpModal from "./HelpModal";
import AnalysisService from "../services/Analysis";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import { clusterName } from "../utils/ClusterNaming";
import { RankingType } from "../enums/RankType";

const pageTitles: Record<string, string> = {
  "/home/dashboard": "Dashboard",
  "/home/import": "Import Data",
  "/home/portfolio": "Portfolio",
  "/home/badges": "Badges",
  "/home/analysis": "Analysis",
  "/home/comparisons": "Comparisons",
  "/home/subscription": "Subscription",
};

const TRANSACTION_RE: RegExp = /^\/home\/portfolio\/([^/]+)\/transactions/;
const ANALYSIS_DETAIL_RE: RegExp = /^\/home\/analysis\/([^/]+)/;

interface NavbarProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const portfolioService = PortfolioService.getInstance();
  const analysisService = AnalysisService.getInstance();

  const { portfolios, selectedPortfolioId, setSelectedPortfolioId } = useSelectedPortfolio();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState<string | null>(null);
  const [analysisClusterName, setAnalysisClusterName] = useState<string | null>(null);

  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const showPortfolioSelect = location.pathname !== "/home/portfolio" && location.pathname !== "/home/comparisons";

  const transactionMatch = TRANSACTION_RE.exec(location.pathname);
  const portfolioId = transactionMatch?.[1] ?? null;

  const analysisDetailMatch = ANALYSIS_DETAIL_RE.exec(location.pathname);
  const analysisDetailId = analysisDetailMatch?.[1] ?? null;
  const searchParams = new URLSearchParams(location.search);
  const analysisType = searchParams.get("type") ?? RankingType.SECTORS;

  useEffect(() => {
    if (!portfolioId) { setPortfolioName(null); return; }
    portfolioService.getPortfolioById(portfolioId).then((p) => setPortfolioName(p.name)).catch(() => setPortfolioName(null));
  }, [portfolioId]);

  useEffect(() => {
    if (!analysisDetailId) { setAnalysisClusterName(null); return; }
    if (!isNaN(Number(analysisDetailId))) {
      setAnalysisClusterName(clusterName(Number(analysisDetailId)));
    } else if (analysisType === RankingType.SECTORS) {
      analysisService.getSectorName(analysisDetailId).then((p) => setAnalysisClusterName(p.sectorName)).catch(() => setPortfolioName(null));
    } else {
      analysisService.getCountryName(analysisDetailId).then((p) => setAnalysisClusterName(p.countryName)).catch(() => setPortfolioName(null));
    }
  }, [analysisDetailId]);

  let title: string;
  let subtitle: string;
  if (portfolioId) {
    title = "Portfolio";
    subtitle = portfolioName ? `${portfolioName} / Transactions` : "Transactions";
  } else if (analysisDetailId) {
    title = "Analysis";
    subtitle = analysisClusterName ? `${analysisClusterName} / Details` : "Cluster details";
  } else if (location.pathname.includes("badges")) {
    title = pageTitles[location.pathname] ?? "Home";
    subtitle = "Your badges";
  } else {
    title = pageTitles[location.pathname] ?? "Home";
    subtitle = "Overview";
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <header className={`fixed top-0 left-0 ${props.sidebarCollapsed ? "lg:left-16" : "lg:left-64"} right-0 h-16 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 sm:px-6 gap-3 transition-all duration-300`}>
        {/* Mobile menu button */}
        <button
          onClick={props.onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-gray-900 font-semibold text-[15px] truncate">{title}</h1>
          <span className="text-gray-300 text-sm hidden sm:inline">/</span>
          <span className="text-gray-400 text-sm hidden sm:inline truncate">{subtitle}</span>
        </div>

        {/* Portfolio selector */}
        {showPortfolioSelect && (
          <PortfolioSelect
            portfolios={portfolios}
            selectedId={selectedPortfolioId}
            onChange={setSelectedPortfolioId}
          />
        )}

        {/* Avatar */}
        <ProfileBlock
          user={user}
          onAvatarClick={() => setDropdownOpen((v) => !v)}
          avatarRef={avatarRef}
        />
      </header>

      {/* Dropdown */}
      {dropdownOpen && (
        <ProfileDropdown
          user={user}
          onLogout={handleLogout}
          onClose={() => setDropdownOpen(false)}
          onProfile={() => setProfileOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onHelp={() => setHelpOpen(true)}
        />
      )}

      {/* Modals */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default Navbar;
