import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import PortfolioService from "../services/PortfolioService";
import type { Portfolio } from "../models/Portfolio";

interface SelectedPortfolioContextValue {
  portfolios: Portfolio[];
  selectedPortfolioId: string;
  setSelectedPortfolioId: (id: string) => void;
}

const SelectedPortfolioContext = createContext<SelectedPortfolioContextValue>({
  portfolios: [],
  selectedPortfolioId: "",
  setSelectedPortfolioId: () => {},
});

export const useSelectedPortfolio = () => useContext(SelectedPortfolioContext);

export const SelectedPortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const portfolioService = PortfolioService.getInstance();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    portfolioService
      .getAllPortfoliosByUserId(user.id)
      .then((p) => {
        setPortfolios(p);
        if (p.length > 0) {
          setSelectedPortfolioId(p[0].id);
        } else if (location.pathname !== "/home/portfolio") {
          navigate("/home/portfolio", { replace: true });
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <SelectedPortfolioContext.Provider value={{ portfolios, selectedPortfolioId, setSelectedPortfolioId }}>
      {children}
    </SelectedPortfolioContext.Provider>
  );
};
