import { fetchReportData } from "../report";
import { generateReportPdf } from "../pdf";

class ReportService {
  async buildReport(year: number, month: number, userId: string) {
    return fetchReportData(year, month, userId);
  }

  async generatePdf(year: number, month: number, userId: string) {
    const data = await this.buildReport(year, month, userId);
    return generateReportPdf(data);
  }
}

export const reportService = new ReportService();
