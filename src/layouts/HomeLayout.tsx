import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProfileDropdown from "../components/ProfileDropdown";

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
        <main className="lg:ml-64 pt-16 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-7 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default HomeLayout;
