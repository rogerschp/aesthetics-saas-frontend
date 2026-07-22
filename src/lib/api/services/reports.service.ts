import { api } from "../client";
import type {
  EliteReport,
  PlanFeatures,
  ProReport,
  ReportExportFormat,
  ReportTier,
  StandardReport,
} from "../types";

const REPORTS_LEVEL: ReportTier[] = [
  "NONE",
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
];

export const PRO_REPORT_DEFAULT_MONTHS = 3;
export const PRO_REPORT_MAX_MONTHS = 3;
export const ELITE_REPORT_DEFAULT_MONTHS = 6;
export const ELITE_REPORT_MAX_MONTHS = 6;

/** Nível efetivo a partir de `plan.features.reports`. */
export function resolveReportTier(
  features: PlanFeatures | undefined | null,
): ReportTier {
  const level = features?.reports ?? "NONE";
  return REPORTS_LEVEL.includes(level as ReportTier)
    ? (level as ReportTier)
    : "NONE";
}

/** Opções de `?months=` conforme o plano. */
export function reportMonthOptions(tier: ReportTier): number[] {
  if (tier === "ADVANCED") {
    return Array.from({ length: ELITE_REPORT_MAX_MONTHS }, (_, i) => i + 1);
  }
  if (tier === "INTERMEDIATE") {
    return Array.from({ length: PRO_REPORT_MAX_MONTHS }, (_, i) => i + 1);
  }
  return [];
}

export function defaultReportMonths(tier: ReportTier): number {
  if (tier === "ADVANCED") return ELITE_REPORT_DEFAULT_MONTHS;
  if (tier === "INTERMEDIATE") return PRO_REPORT_DEFAULT_MONTHS;
  return 1;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const reportsService = {
  /** GET /tenants/:tenantId/reports/standard — STANDARD+ */
  getStandard: async (tenantId: string): Promise<StandardReport> => {
    const response = await api.get(`/tenants/${tenantId}/reports/standard`);
    return response as any;
  },

  /** GET /tenants/:tenantId/reports/pro?months= — PRO+ (1–3, default 3) */
  getPro: async (
    tenantId: string,
    months: number = PRO_REPORT_DEFAULT_MONTHS,
  ): Promise<ProReport> => {
    const response = await api.get(`/tenants/${tenantId}/reports/pro`, {
      params: { months },
    });
    return response as any;
  },

  /** GET /tenants/:tenantId/reports/elite?months= — ELITE (1–6, default 6) */
  getElite: async (
    tenantId: string,
    months: number = ELITE_REPORT_DEFAULT_MONTHS,
  ): Promise<EliteReport> => {
    const response = await api.get(`/tenants/${tenantId}/reports/elite`, {
      params: { months },
    });
    return response as any;
  },

  /**
   * Escolhe o endpoint mais rico permitido pelo plano.
   * BASIC → standard · INTERMEDIATE → pro · ADVANCED → elite
   */
  getForTier: async (
    tenantId: string,
    tier: ReportTier,
    months?: number,
  ): Promise<StandardReport | ProReport | EliteReport> => {
    if (tier === "ADVANCED") {
      return reportsService.getElite(
        tenantId,
        months ?? ELITE_REPORT_DEFAULT_MONTHS,
      );
    }
    if (tier === "INTERMEDIATE") {
      return reportsService.getPro(
        tenantId,
        months ?? PRO_REPORT_DEFAULT_MONTHS,
      );
    }
    if (tier === "BASIC") return reportsService.getStandard(tenantId);
    throw new Error("PLAN_FEATURE_NOT_AVAILABLE");
  },

  /**
   * GET /tenants/:tenantId/reports/export?format=pdf|excel&months=
   * ELITE (`reportExport`) — mesma janela do /elite (1–6).
   */
  exportAndDownload: async (
    tenantId: string,
    format: ReportExportFormat,
    months: number = ELITE_REPORT_DEFAULT_MONTHS,
  ): Promise<void> => {
    const blob = (await api.get(`/tenants/${tenantId}/reports/export`, {
      params: { format, months },
      responseType: "blob",
    })) as unknown as Blob;

    const ext = format === "excel" ? "xlsx" : "pdf";
    downloadBlob(blob, `relatorio-elite-${months}m.${ext}`);
  },
};
