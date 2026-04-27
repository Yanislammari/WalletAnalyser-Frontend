import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ActivationBanner from "../components/ActivationBanner";

const HomeLayout: React.FC = () => {
  const { user, sendActivationEmail } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);

  const handleSendActivationEmail = async () => {
    try {
      await sendActivationEmail();
      toast.success("Activation email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send the email. Please try again.");
    }
  };

  useEffect(() => {
    if (user && user.activated === false && sessionStorage.getItem("showActivationBanner") === "true") {
      setBannerVisible(true);
    }
    if (sessionStorage.getItem("accountJustActivated") === "true") {
      sessionStorage.removeItem("accountJustActivated");

      // Affiche la modal de succès d'activation
    }
  }, [user]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
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
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="lg:ml-64 pt-16 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-7 py-6 sm:py-8 space-y-5">
          {bannerVisible && (
            <ActivationBanner
              onClose={() => {
                sessionStorage.removeItem("showActivationBanner");
                setBannerVisible(false);
              }}
              onSendEmail={handleSendActivationEmail}
            />
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
