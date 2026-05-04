export interface AddAssetSellPayload {
  portfolioId: string;
  companyName?: string;
  assetPriceId?: string;
  sellCurrencyId: string;
  sellDate: string;
  assetSellAmount?: number;
  assetSellShare?: number;
  averageAssetShareBuyPrice?: number;
  assetSellGain?: number;
}
