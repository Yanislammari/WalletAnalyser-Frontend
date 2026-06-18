import type { AssetAnalysisResponse, AssetRankingResponse, SectorNameResponse } from "../responses/AssetAnalysisResponse";
import BaseService from "./BaseService";

class AnalysisService extends BaseService {
  private static instance: AnalysisService;
  private readonly url = "/clusters/"

  private constructor() {
    super();
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  public async getSectorsMetaData(): Promise<AssetAnalysisResponse> {
    return this.request<AssetAnalysisResponse>(this.url + "sectors", {
        method: "GET" 
    });
  }

  public async getClustersMetaData(): Promise<AssetAnalysisResponse> {
    return this.request<AssetAnalysisResponse>(this.url + "clusters", {
        method: "GET" 
    });
  }

  public async getUserStocksMetaData(): Promise<AssetRankingResponse>{
    return this.request<AssetRankingResponse>(this.url + "user_stocks", {
        method: "GET" 
    });
  }

  public async getWholeSectorsDetailMetaData(type : string, sector_uuid : string): Promise<AssetRankingResponse>{
    return this.request<AssetRankingResponse>(this.url + `sector_detail?type=${type}&sector_uuid=${sector_uuid}`, {
        method: "GET" 
    });
  }

  public async getSectorName(sector_uuid : string): Promise<SectorNameResponse>{
    return this.request<SectorNameResponse>(this.url + `name/${sector_uuid}`, {
        method: "GET" 
    });
  }
}

export default AnalysisService;