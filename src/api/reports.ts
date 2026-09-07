import { api } from "./client";

export interface ReportSummary {
  tickets: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: { key: string; count: number }[];
  };
  assets: {
    total: number;
    byStatus: Record<string, number>;
    byType: { key: string; count: number }[];
  };
  bookings: { upcoming: number };
}

export const reportsApi = {
  summary: () => api<ReportSummary>("/reports/summary"),
};
