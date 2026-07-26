"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsService } from "@/features/reports/api/reports.service";
import type {
  ReportExportFormat,
  ReportTier,
} from "@/features/reports/model/reports.types";
import { reportsKeys } from "@/features/reports/api/reports.keys";

/** GET /tenants/:tenantId/subscription — usado por ReportsPanel. */
export function useReportsSubscription(tenantId: string) {
  return useQuery({
    queryKey: reportsKeys.subscription(tenantId),
    queryFn: () => reportsService.getSubscription(tenantId),
    staleTime: 5 * 60 * 1000,
  });
}

/** GET /tenants/:tenantId/reports/:tier — usado por ReportsPanel. */
export function useTenantReport(
  tenantId: string,
  tier: ReportTier,
  months: number | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: reportsKeys.tenantReport(tenantId, tier, months),
    queryFn: () => reportsService.getForTier(tenantId, tier, months ?? undefined),
    enabled,
    retry: false,
    staleTime: 60 * 1000,
  });
}

/** GET /tenants/:tenantId/reports/export — usado por ReportsPanel. */
export function useExportReport(tenantId: string, months: number) {
  return useMutation({
    mutationFn: (format: ReportExportFormat) =>
      reportsService.exportAndDownload(tenantId, format, months),
  });
}
