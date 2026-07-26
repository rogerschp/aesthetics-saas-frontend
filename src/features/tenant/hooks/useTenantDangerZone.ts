"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { tenantsService } from "@/features/tenant/api/tenants.service";
import { Tenant, TenantStatus } from "@/features/tenant/model/tenant.types";
import { tenantKeys } from "@/features/tenant/api/tenant.keys";
import { sessionKeys } from "@/shared/lib/api/session.keys";

type Callbacks<TVariables> = Pick<
  UseMutationOptions<Tenant, unknown, TVariables>,
  "onSuccess" | "onError"
>;

/** PATCH /tenants/:id — status ACTIVE/INACTIVE — usado por TenantDangerZone. */
export function useUpdateTenantStatus(
  tenantId: string,
  options?: Callbacks<TenantStatus>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (next: TenantStatus) =>
      tenantsService.update(tenantId, { status: next }),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.edit(tenantId) });
      await queryClient.invalidateQueries({ queryKey: sessionKeys.tenantsAll });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** DELETE /tenants/:id — usado por TenantDangerZone. */
export function useDeleteTenant(
  tenantId: string,
  options?: Pick<
    UseMutationOptions<void, unknown, void>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tenantsService.delete(tenantId),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: sessionKeys.tenantsAll });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
