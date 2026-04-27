import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import Avatar from "../components/Avatar";
import Sidebar from "../components/Sidebar";

// ─── Navbar ───────────────────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  "/home/dashboard": "Dashboard",
  "/home/import": "Import Data",
};

interface NavbarProps {
  user: ReturnType<typeof useAuth>["user"];
  onAvatarClick: () => void;
  onMenuClick: () => void;
  avatarRef: React.RefObject<HTMLButtonElement | null>;
}

const Navbar: React.FC<NavbarProps> = ({ user, onAvatarClick, onMenuClick, avatarRef }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Home";

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 sm:px-6 gap-3">

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
        aria-label="Open menu"
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <h1 className="text-gray-900 font-semibold text-[15px] truncate">{title}</h1>
        <span className="text-gray-300 text-sm hidden sm:inline">/</span>
        <span className="text-gray-400 text-sm hidden sm:inline">Overview</span>
      </div>

      {/* Search */}
      <div className="relative hidden md:block shrink-0">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search…"
          className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 w-48 lg:w-52 transition-all"
        />
      </div>

      {/* Bell */}
      <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0">
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-white" />
      </button>

      {/* Avatar */}
      <button
        ref={avatarRef}
        onClick={onAvatarClick}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
      >
        <Avatar
          pictureUrl={user?.googlePictureUrl}
          firstName={user?.firstName}
          lastName={user?.lastName}
          size="sm"
        />
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-semibold text-gray-800 leading-tight max-w-[120px] truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[11px] text-gray-400 leading-tight max-w-[120px] truncate">{user?.email}</p>
        </div>
        <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </header>
  );
};

// ─── Profile dropdown ─────────────────────────────────────────────────────────

interface ProfileDropdownProps {
  user: ReturnType<typeof useAuth>["user"];
  onLogout: () => void;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="fixed right-3 sm:right-6 top-[68px] z-50 w-[calc(100vw-24px)] max-w-[280px] bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden"
      style={{ animation: "dropIn 0.15s ease-out" }}
    >
      <div className="px-5 py-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar
            pictureUrl={user?.googlePictureUrl}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="lg"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[12px] text-gray-500 mt-0.5 truncate">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full">
              <span className="w-1 h-1 rounded-full bg-purple-500" />
              Pro Plan
            </span>
          </div>
        </div>
      </div>

      <div className="py-2">
        {[
          {
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            label: "My profile",
          },
          {
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            label: "Settings",
          },
          {
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: "Help & support",
          },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-gray-400">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="py-2 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
};

// ─── Layout ───────────────────────────────────────────────────────────────────

const HomeLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f5f4fb]">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Navbar
          user={user}
          onAvatarClick={() => setDropdownOpen((v) => !v)}
          onMenuClick={() => setSidebarOpen((v) => !v)}
          avatarRef={avatarRef}
        />

        {dropdownOpen && (
          <ProfileDropdown
            user={user}
            onLogout={handleLogout}
            onClose={() => setDropdownOpen(false)}
          />
        )}

        {/* Contenu de la route enfant */}
        <main className="lg:ml-64 pt-16 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-7 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeLayout;
