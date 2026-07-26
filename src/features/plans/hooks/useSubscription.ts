"use client";

import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/features/plans/api/subscription.service";
import { plansKeys } from "@/features/plans/api/plans.keys";

/** GET /tenants/:tenantId/subscription — usado por SubscriptionCard e TenantEditPage. */
export function useSubscription(tenantId?: string) {
  return useQuery({
    queryKey: plansKeys.subscription(tenantId),
    queryFn: () => subscriptionService.get(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
