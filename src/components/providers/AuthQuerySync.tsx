"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

import { TENANT_STORAGE_KEY } from "@/components/providers/TenantProvider";
import { clearCachedIdToken } from "@/lib/api/client";

/**
 * Limpa o cache do React Query (e o tenant selecionado) sempre que
 * o usuário da sessão muda — inclusive no logout. Evita vazar dados
 * da conta anterior (ex.: "você é profissional") após trocar de login.
 */
export function AuthQuerySync() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id ?? null;
  const prevUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    if (prevUserId.current === undefined) {
      prevUserId.current = userId;
      return;
    }

    if (prevUserId.current !== userId) {
      queryClient.clear();
      clearCachedIdToken();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TENANT_STORAGE_KEY);
      }
      prevUserId.current = userId;
    }
  }, [userId, status, queryClient]);

  return null;
}
