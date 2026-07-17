import BaseService from "./BaseService";
import type { Format } from "../enums/Format";
import { BACKEND_BASE_URL } from "../constants/env";

export interface ImportRowError {
  row: number;
  ticker: string;
  reason: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: ImportRowError[];
}

export interface ImportHistoryItem {
  id: string;
  filename: string | null;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportRowError[];
  createdAt: string;
}

class ImportService extends BaseService {
  private static instance: ImportService;

  private constructor() {
    super();
  }

  public static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  public async downloadTemplate(format: Format): Promise<void> {
    const token = localStorage.getItem("token") ?? "";
    const res: Response = await fetch(`${this.baseUrl}/import/template/${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to download template: ${res.statusText}`);
    }

    const blob: Blob = await res.blob();
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");

    a.href = url;
    a.download = `ASSETS_TRANSACTIONS_EXAMPLE_${format.toUpperCase()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Uploads a CSV file and imports buy/sell transactions into the given portfolio.
   * The backend resolves tickers, fetches historical prices, auto-creates custom assets,
   * syncs dividends for each imported asset, and persists the import record.
   */
  public async importCsv(portfolioId: string, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token") ?? "";
    const res = await fetch(`${BACKEND_BASE_URL}/import/portfolio/${portfolioId}/csv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // No Content-Type — browser sets it automatically with the multipart boundary
      },
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      const error = await res.json().catch(() => ({ message: "Import failed" }));
      throw new Error(error.message || "Import failed");
    }

    return res.json() as Promise<ImportResult>;
  }

  /**
   * Fetches the import history for a portfolio (most recent 20 imports).
   */
  public async getImportHistory(portfolioId: string): Promise<ImportHistoryItem[]> {
    return this.request<ImportHistoryItem[]>(
      `/import/portfolio/${portfolioId}/history`,
      { method: "GET" }
    );
  }
}

export default ImportService;
