import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";

const STORAGE_KEY = "wa_selected_portfolio";

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
  const [selectedPortfolioId, setSelectedPortfolioIdState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );

  const setSelectedPortfolioId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setSelectedPortfolioIdState(id);
  }, []);

  const fetchPortfolios = useCallback(async (currentSelectedId?: string) => {
    if (!user) return;
    try {
      const p = await portfolioService.getAllPortfoliosByUserId(user.id);
      setPortfolios(p);
      setPortfoliosLoaded(true);
      if (p.length > 0) {
        // Prioritize: explicit arg > localStorage > first portfolio
        const candidateId = currentSelectedId ?? localStorage.getItem(STORAGE_KEY) ?? "";
        const stillExists = candidateId && p.some(x => x.id === candidateId);
        if (!stillExists) {
          setSelectedPortfolioId(p[0].id);
        } else {
          // Ensure state is in sync (e.g. after page refresh)
          setSelectedPortfolioIdState(candidateId);
        }
      }
    } catch {
      setPortfoliosLoaded(true);
    }
  }, [user, setSelectedPortfolioId]);

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
