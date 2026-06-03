import { BaseService } from "./BaseService";

class AnalysisService extends BaseService {
  private static instance: AnalysisService;

  private constructor() {
    super();
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }
}

export default AnalysisService;