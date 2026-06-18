import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";

interface SelectedPortfolioContextValue {
  portfolios: Portfolio[];
  portfoliosLoaded: boolean;
  selectedPortfolioId: string;
  setSelectedPortfolioId: (id: string) => void;
}

const SelectedPortfolioContext = createContext<SelectedPortfolioContextValue>({
  portfolios: [],
  portfoliosLoaded: false,
  selectedPortfolioId: "",
  setSelectedPortfolioId: () => {},
});

export const useSelectedPortfolio = () => useContext(SelectedPortfolioContext);

export const SelectedPortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const portfolioService = PortfolioService.getInstance();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfoliosLoaded, setPortfoliosLoaded] = useState<boolean>(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    portfolioService
      .getAllPortfoliosByUserId(user.id)
      .then((p) => {
        setPortfolios(p);
        setPortfoliosLoaded(true);
        if (p.length > 0) setSelectedPortfolioId(p[0].id);
      })
      .catch(() => { setPortfoliosLoaded(true); });
  }, [user]);

  return (
    <SelectedPortfolioContext.Provider value={{ portfolios, portfoliosLoaded, selectedPortfolioId, setSelectedPortfolioId }}>
      {children}
    </SelectedPortfolioContext.Provider>
  );
};
