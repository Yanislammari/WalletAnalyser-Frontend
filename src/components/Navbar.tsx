import React from "react";
import { useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import type { User } from "../models/User";

const pageTitles: Record<string, string> = {
  "/home/dashboard": "Dashboard",
  "/home/import": "Import Data",
};

interface NavbarProps {
  user: User | null;
  onAvatarClick: () => void;
  onMenuClick: () => void;
  avatarRef: React.RefObject<HTMLButtonElement | null>;
}

const Navbar: React.FC<NavbarProps> = ({ user, onAvatarClick, onMenuClick, avatarRef }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Home";

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 sm:px-6 gap-3">
      <button
        onClick={onMenuClick}
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
        <span className="text-gray-400 text-sm hidden sm:inline">Overview</span>
      </div>
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
      <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0">
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-white" />
      </button>
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
}

export default Navbar;
