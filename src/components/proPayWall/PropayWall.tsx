import { HiOutlineChartPie } from "react-icons/hi";

export const ProPaywall: React.FC<{ feature: string }> = ({ feature }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
      <HiOutlineChartPie size={32} className="text-purple-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{feature} is a Pro feature</h2>
    <p className="text-gray-500 text-sm max-w-sm mb-6">
      Upgrade to Pro to unlock benchmark comparisons, full historical analysis, and much more.
    </p>
    <a
      href="/home/subscription"
      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors"
    >
      Upgrade to Pro — €29.99/mo
    </a>
  </div>
);