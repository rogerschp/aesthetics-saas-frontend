"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { sessionService } from "@/shared/lib/api/services/session.service";
import { sessionKeys } from "@/shared/lib/api/session.keys";

/** GET /users/me/tenants for TenantProvider. Kept out of features on purpose. */
export function useMyTenants() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: sessionKeys.tenants(userId),
    queryFn: () => sessionService.getMyTenants(),
    enabled: status === "authenticated" && !!userId,
    // Membership muda pouco; invalidar após create/delete/invite (hooks/pages).
    staleTime: 5 * 60 * 1000,
    // Free tier (Render/Neon) pode demorar no cold start.
    retry: 2,
    retryDelay: (attempt: number) => Math.min(1500 * 2 ** attempt, 8000),
  });
}
