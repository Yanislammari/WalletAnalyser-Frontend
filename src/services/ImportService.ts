import BaseService from "./BaseService";
import type { Format } from "../enums/Format";

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
    const res: Response = await fetch(`${this.baseUrl}/import/template/${format}`);

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
}

export default ImportService;
