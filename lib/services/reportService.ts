import { fetchReportData } from "../report";
import { generateReportPdf } from "../pdf";

class ReportService {
  async buildReport(year: number, month: number) {
    return fetchReportData(year, month);
  }

  async generatePdf(year: number, month: number) {
    const data = await this.buildReport(year, month);
    return generateReportPdf(data);
  }
}

export const reportService = new ReportService();
