import React, { useEffect, useRef } from "react";
import type { User } from "../models/User";
import Avatar from "./Avatar";
import { HiOutlineUserCircle, HiOutlineCog6Tooth, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import type { ProfileDropdownItem } from "../models/items/ProfileDropdownItem";

const PROFILE_DROPDOWN_ITEMS: ProfileDropdownItem[] = [
  {
    icon: <HiOutlineUserCircle className="w-4 h-4" />,
    label: "My profile",
  },
  {
    icon: <HiOutlineCog6Tooth className="w-4 h-4" />,
    label: "Settings",
  },
  {
    icon: <HiOutlineQuestionMarkCircle className="w-4 h-4" />,
    label: "Help & support",
  },
];

interface ProfileDropdownProps {
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onClose }) => {
  const dropdownRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

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
        {PROFILE_DROPDOWN_ITEMS.map((item) => (
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
}

export default ProfileDropdown;
