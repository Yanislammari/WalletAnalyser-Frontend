import type { NavigateFunction } from "react-router-dom";

export interface PricingPlanUI {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
  onClick : (nav : NavigateFunction) => void
}
