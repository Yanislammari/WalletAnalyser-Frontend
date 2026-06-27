import BaseService from "./BaseService";

export interface BenchmarkMonthlyPoint {
  month: string;
  price: number;
}

export const BENCHMARKS = [
  { id: "^GSPC",  label: "S&P 500",    color: "#f97316" },
  { id: "^FCHI",  label: "CAC 40",     color: "#eab308" },
  { id: "URTH",   label: "MSCI World", color: "#10b981" },
  { id: "^NDX",   label: "NASDAQ 100", color: "#e11d48" },
] as const;

export type BenchmarkId = typeof BENCHMARKS[number]["id"];

class BenchmarkService extends BaseService {
  private static instance: BenchmarkService;

  private constructor() {
    super();
  }

  public static getInstance(): BenchmarkService {
    if (!BenchmarkService.instance) {
      BenchmarkService.instance = new BenchmarkService();
    }
    return BenchmarkService.instance;
  }

  public async getHistory(ticker: string, from?: string): Promise<BenchmarkMonthlyPoint[]> {
    const params = new URLSearchParams({ ticker });
    if (from) params.set("from", from);
    return this.request<BenchmarkMonthlyPoint[]>(`/asset/benchmark?${params}`, { method: "GET" });
  }
}

export default BenchmarkService;
