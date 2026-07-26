"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { tenantsService } from "@/features/tenant/api/tenants.service";
import { Tenant } from "@/features/tenant/model/tenant.types";

export interface CancellationSettingsInput {
  enabled: boolean;
  leadMinutes: number;
}

/** PATCH /tenants/:id — política de cancelamento — usado por CancellationSettingsForm. */
export function useUpdateCancellationSettings(
  tenantId: string,
  options?: Pick<
    UseMutationOptions<Tenant, unknown, CancellationSettingsInput>,
    "onSuccess" | "onError"
  >,
) {
  return useMutation({
    mutationFn: ({ enabled, leadMinutes }: CancellationSettingsInput) =>
      tenantsService.update(tenantId, {
        clientCanCancelConfirmed: enabled,
        clientCancelConfirmedMinLeadMinutes: leadMinutes,
      }),
    ...options,
  });
}
