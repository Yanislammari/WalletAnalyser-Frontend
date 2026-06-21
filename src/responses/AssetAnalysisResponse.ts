interface Sector {
  uuid: string;
  sector_name: string;
  created_at: string;
  updated_at: string;
}

interface Asset {
  uuid: string;
  display_name: string;
  sector_uuid: string;
  asset_type?: string;
}

interface Performer {
  asset: Asset;
  perf: number;
}

interface SectorData {
  sector?: Sector;
  unique_key?: number;
  country?: Country;
  length: number;
  mean_perf: number;
  best_performers: Performer[];
  worst_performers: Performer[];
}

export interface AssetAnalysisResponse {
  sectorsData: SectorData[];
}

interface Country {
  uuid: string;
  country_name: string;
  created_at: string;
  updated_at: string;
}

interface DetailedAsset {
  uuid: string;
  base_currency_uuid: string;
  asset_type: string;
  ticker_name: string;
  official_name: string;
  display_name: string;
  sector_uuid: string;
  country_uuid: string;
  created_at: string;
  updated_at: string;
  sector: Sector;
  country: Country;
}

export interface RankedAsset {
  asset: DetailedAsset;
  rank: string;
  rank_position : number;
  perf: number;
}

export interface AssetRankingResponse {
  sectorsData: RankedAsset[];
}

interface AssetEntry {
  asset: DetailedAsset;
  perf: number;
  rank?: string;
}

export interface AssetPerformanceResponse {
  sectorsData: AssetEntry[];
}

export interface SectorNameResponse {
  sectorName: string;
}