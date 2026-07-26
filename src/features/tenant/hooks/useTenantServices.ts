"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/features/tenant/api/catalog.service";
import { tenantKeys } from "@/features/tenant/api/tenant.keys";

/** GET /tenants/:tenantId/services — usado por TenantEditPage e TenantServicesImages. */
export function useTenantServices(tenantId?: string) {
  return useQuery({
    queryKey: tenantKeys.editServices(tenantId),
    queryFn: () => catalogService.list(tenantId!),
    enabled: !!tenantId,
  });
}
