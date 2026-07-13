import React, { useState, useEffect } from "react";
import { HiOutlineXMark, HiOutlineUser, HiOutlineEnvelope, HiOutlineTrash, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import AuthService from "../services/AuthService";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user, updateLocalUser } = useAuth();
  const authService = AuthService.getInstance();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pre-fill form whenever the modal opens (or user data changes)
  useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setShowDeleteConfirm(false);
    }
  }, [open, user]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount();
      // Clear all local storage manually (avoid the "session expired" toast from logout())
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("justLoggedIn");
      sessionStorage.removeItem("showActivationBanner");
      toast.success("Your account has been permanently deleted.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      updateLocalUser(updated);
      toast.success("Profile updated.");
      onClose();
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("409") || msg.includes("already")) {
        toast.error("This email is already in use.");
      } else {
        toast.error("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop — pointer-events-none so it doesn't intercept input clicks */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-7 pb-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-100">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md flex items-center justify-center bg-purple-600">
            {user?.googlePictureUrl ? (
              <img
                src={user.googlePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-white text-2xl font-bold select-none">
                {(user?.firstName?.[0] ?? "").toUpperCase()}{(user?.lastName?.[0] ?? "").toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-3 font-semibold text-gray-900 text-sm">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">First name</label>
              <div className="relative">
                <HiOutlineUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <div className="relative">
              <HiOutlineEnvelope size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !firstName.trim() || !lastName.trim() || !email.trim()}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {saving
                ? <span className="loading loading-spinner loading-xs text-white" />
                : "Save changes"
              }
            </button>
          </div>

          {/* Danger zone */}
          <div className="pt-2 border-t border-gray-100 mt-1">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <HiOutlineTrash size={13} />
                Delete my account
              </button>
            ) : (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <HiOutlineExclamationTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    <span className="font-semibold">This cannot be undone.</span> Your account, all portfolios, and all transactions will be permanently deleted.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting
                      ? <span className="loading loading-spinner loading-xs text-white" />
                      : "Yes, delete everything"
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
