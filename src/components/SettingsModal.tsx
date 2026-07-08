import React, { useState, useEffect } from "react";
import { HiOutlineXMark, HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type ThemeMode = "light" | "dark";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <HiOutlineSun size={16} /> },
  { value: "dark",  label: "Dark",  icon: <HiOutlineMoon size={16} /> },
];

const applyTheme = (t: ThemeMode) => {
  localStorage.setItem("wa_theme", t);
  document.documentElement.classList.toggle("dark", t === "dark");
};

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Load persisted preference on open
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("wa_theme");
      setTheme(saved === "dark" ? "dark" : "light");
    }
  }, [open]);

  const handleTheme = (t: ThemeMode) => {
    setTheme(t);
    applyTheme(t);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Appearance</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                {theme === "dark" ? <HiOutlineMoon size={16} /> : <HiOutlineSun size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Theme</p>
                <p className="text-xs text-gray-400">Choose your color scheme</p>
              </div>
            </div>

            {/* Segmented control */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-medium">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTheme(opt.value)}
                  title={opt.label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-colors ${
                    theme === opt.value
                      ? "bg-purple-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {opt.icon}
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export helper so index.tsx (or wherever) can restore the theme on boot
export { applyTheme };
export default SettingsModal;
