import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";

interface SelectedPortfolioContextValue {
  portfolios: Portfolio[];
  portfoliosLoaded: boolean;
  selectedPortfolioId: string;
  setSelectedPortfolioId: (id: string) => void;
  refreshPortfolios: () => Promise<void>;
}

const SelectedPortfolioContext = createContext<SelectedPortfolioContextValue>({
  portfolios: [],
  portfoliosLoaded: false,
  selectedPortfolioId: "",
  setSelectedPortfolioId: () => {},
  refreshPortfolios: async () => {},
});

export const useSelectedPortfolio = () => useContext(SelectedPortfolioContext);

export const SelectedPortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const portfolioService = PortfolioService.getInstance();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfoliosLoaded, setPortfoliosLoaded] = useState<boolean>(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");

  const fetchPortfolios = useCallback(async (currentSelectedId?: string) => {
    if (!user) return;
    try {
      const p = await portfolioService.getAllPortfoliosByUserId(user.id);
      setPortfolios(p);
      setPortfoliosLoaded(true);
      if (p.length > 0) {
        // Keep the current selection if it still exists, otherwise pick the first
        const stillExists = currentSelectedId && p.some(x => x.id === currentSelectedId);
        if (!stillExists) setSelectedPortfolioId(p[0].id);
      }
    } catch {
      setPortfoliosLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const refreshPortfolios = useCallback(async () => {
    await fetchPortfolios(selectedPortfolioId);
  }, [fetchPortfolios, selectedPortfolioId]);

  return (
    <SelectedPortfolioContext.Provider value={{ portfolios, portfoliosLoaded, selectedPortfolioId, setSelectedPortfolioId, refreshPortfolios }}>
      {children}
    </SelectedPortfolioContext.Provider>
  );
};
