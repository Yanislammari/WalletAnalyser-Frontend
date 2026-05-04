const PORTFOLIO_COLORS: string[] = [
  "from-purple-500 to-indigo-600",
  "from-indigo-500 to-blue-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

export const getPortfolioColor = (portfolioId: string | number): string => {
  const value = String(portfolioId);
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return PORTFOLIO_COLORS[Math.abs(hash) % PORTFOLIO_COLORS.length];
};
