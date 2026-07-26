"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { sessionService } from "@/shared/lib/api/services/session.service";
import { sessionKeys } from "@/shared/lib/api/session.keys";

/** GET /users/me for the shared shell (Header). Kept out of features on purpose. */
export function useSessionMe() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: sessionKeys.me(userId),
    queryFn: () => sessionService.getMe(),
    enabled: status === "authenticated" && !!userId,
    staleTime: 60 * 1000,
  });
}
