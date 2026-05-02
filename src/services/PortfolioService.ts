import { BaseService } from "./BaseService";
import type { Portfolio } from "../models/Portfolio";
import type { AssetBuyResponse } from "../models/transactions/AssetBuyResponse";
import type { AssetSellResponse } from "../models/transactions/AssetSellResponse";
import type { AssetDividendResponse } from "../models/transactions/AssetDividendResponse";
import type { CreatePortfolioPayload } from "../payloads/CreatePortfolioPayload";
import type { AddAssetBuyPayload } from "../payloads/AddAssetBuyPayload";
import type { AddAssetSellPayload } from "../payloads/AddAssetSellPayload";
import type { AddAssetDividendPayload } from "../payloads/AddAssetDividendPayload";

class PortfolioService extends BaseService {
  private static instance: PortfolioService;

  private constructor() {
    super();
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  public async getPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
    return this.request<Portfolio[]>(`/portfolio/user/${userId}`, {
      method: "GET",
    });
  }

  public async getPortfolioById(portfolioId: string): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolio/${portfolioId}`, {
      method: "GET",
    });
  }

  public async createPortfolio(payload: CreatePortfolioPayload): Promise<Portfolio> {
    return this.request<Portfolio>("/portfolio", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async getBuysByPortfolioId(portfolioId: string): Promise<AssetBuyResponse[]> {
    return this.request<AssetBuyResponse[]>(`/portfolio/${portfolioId}/buys`, {
      method: "GET"
    });
  }

  public async addAssetBuy(payload: AddAssetBuyPayload): Promise<AssetBuyResponse> {
    return this.request<AssetBuyResponse>(`/portfolio/${payload.portfolioId}/buys`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async getSellsByPortfolioId(portfolioId: string): Promise<AssetSellResponse[]> {
    return this.request<AssetSellResponse[]>(`/portfolio/${portfolioId}/sells`, {
      method: "GET"
    });
  }

  public async addAssetSell(payload: AddAssetSellPayload): Promise<AssetSellResponse> {
    return this.request<AssetSellResponse>(`/portfolio/${payload.portfolioId}/sells`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async getDividendsByPortfolioId(portfolioId: string): Promise<AssetDividendResponse[]> {
    return this.request<AssetDividendResponse[]>(`/portfolio/${portfolioId}/dividends`, {
      method: "GET"
    });
  }

  public async addAssetDividend(payload: AddAssetDividendPayload): Promise<AssetDividendResponse> {
    return this.request<AssetDividendResponse>(`/portfolio/${payload.portfolioId}/dividends`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export default PortfolioService;
