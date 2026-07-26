"use client";

import { useQuery } from "@tanstack/react-query";
import { plansService } from "@/features/plans/api/plans.service";
import { plansKeys } from "@/features/plans/api/plans.keys";

/** GET /plans — usado por PlansCatalog. */
export function usePlans() {
  return useQuery({
    queryKey: plansKeys.list,
    queryFn: () => plansService.list(),
    staleTime: 10 * 60 * 1000,
  });
}
