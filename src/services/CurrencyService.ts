import { BaseService } from "./BaseService";
import type { Currency } from "../models/Currency";

class CurrencyService extends BaseService {
  private static instance: CurrencyService;

  private constructor() {
    super();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public async getAll(): Promise<Currency[]> {
    return this.request<Currency[]>("/currency", {
      method: "GET" 
    });
  }
}

export default CurrencyService;
