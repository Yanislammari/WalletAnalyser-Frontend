import React, { useState } from "react";
import { HiOutlineXMark, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlinePaperAirplane } from "react-icons/hi2";
import { toast } from "sonner";
import AuthService from "../services/AuthService";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How do I add a transaction?",
    a: "Go to Portfolios, select your portfolio, then click on the Transactions tab. Use the '+ Buy', '+ Sell', or '+ Dividend' buttons to record transactions.",
  },
  {
    q: "What is the Free plan limited to?",
    a: "The Free plan allows 1 portfolio, basic metrics, and limits transaction dates to the last 12 months. Import Data and Comparisons require a Pro subscription.",
  },
  {
    q: "How does price fetching work?",
    a: "WalletAnalyser fetches historical prices from Yahoo Finance automatically at startup. Prices are cached for up to 5 years and updated daily.",
  },
  {
    q: "Can I import from my broker?",
    a: "Yes! On the Import Data page (Pro plan), download the template in CSV, XLS or XLSX format, fill it in with your transactions, and upload it.",
  },
  {
    q: "How is capital gain calculated?",
    a: "Capital gain = (current price − average buy price) × number of shares held. WalletAnalyser uses the weighted average cost method across all your buys.",
  },
  {
    q: "How do I cancel my Pro subscription?",
    a: "Go to the Subscription page in the sidebar, then click 'Manage billing'. From there you can cancel at any time — you keep access until the end of the billing period.",
  },
  {
    q: "Is my data secure?",
    a: "All data is stored in a private database and transmitted over HTTPS. We never share your portfolio data with third parties.",
  },
];

const inputCls = "w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all";

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const authService = AuthService.getInstance();

  if (!open) return null;

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    try {
      await authService.sendContact(subject.trim(), message.trim());
      toast.success("Message sent! We'll get back to you shortly.");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Help & Support</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {(["faq", "contact"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "faq" ? "FAQ" : "Contact us"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {activeTab === "faq" ? (
            <div className="divide-y divide-gray-50">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="px-6">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                  >
                    <span className="text-sm font-medium text-gray-800 group-hover:text-purple-600 transition-colors pr-4">
                      {item.q}
                    </span>
                    {expanded === i
                      ? <HiOutlineChevronUp size={16} className="text-purple-500 shrink-0" />
                      : <HiOutlineChevronDown size={16} className="text-gray-400 shrink-0" />
                    }
                  </button>
                  {expanded === i && (
                    <p className="text-sm text-gray-500 pb-4 leading-relaxed -mt-1">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Have a question or found a bug? Send us a message and we'll get back to you as soon as possible.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
                <input
                  className={inputCls}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bug report, Feature request..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {sending
                  ? <span className="loading loading-spinner loading-xs text-white" />
                  : <><HiOutlinePaperAirplane size={15} /> Send message</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
