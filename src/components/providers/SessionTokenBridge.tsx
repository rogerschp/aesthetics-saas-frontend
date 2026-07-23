"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setCachedIdToken, clearCachedIdToken } from "@/lib/api/client";

/**
 * Espelha o idToken do SessionProvider (já em memória/React) no cache
 * usado pelo axios — evita GET /api/auth/session a cada request da API.
 */
export function SessionTokenBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      clearCachedIdToken();
      return;
    }
    setCachedIdToken(session?.idToken);
  }, [session?.idToken, status]);

  return null;
}
