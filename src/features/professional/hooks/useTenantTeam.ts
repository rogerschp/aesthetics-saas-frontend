"use client";

import { useQuery } from "@tanstack/react-query";
import { tenantProfessionalsService } from "@/features/professional/api/tenant-professionals.service";
import { professionalKeys } from "@/features/professional/api/professional.keys";

/**
 * GET /tenants/:tenantId/tenant-professionals — usado pelo dashboard do
 * profissional (`/barbeiro/[id]`) para localizar o próprio vínculo (tp).
 */
export function useMyTenantTeam(
  sessionUserId?: string,
  tenantId?: string,
  activeOnly = true,
) {
  return useQuery({
    queryKey: professionalKeys.myTeam(sessionUserId, tenantId),
    queryFn: () => tenantProfessionalsService.list(tenantId!, activeOnly),
    enabled: !!tenantId && !!sessionUserId,
  });
}
