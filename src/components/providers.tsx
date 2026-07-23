"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { TenantProvider } from "@/components/providers/TenantProvider";
import { AuthQuerySync } from "@/components/providers/AuthQuerySync";
import { SessionTokenBridge } from "@/components/providers/SessionTokenBridge";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider
      // Evita rajada de GET /api/auth/session no foco/remoount.
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      // Rotação do Firebase idToken (~1h). Não precisa no mount.
      refetchInterval={5 * 60}
    >
      <QueryClientProvider client={queryClient}>
        <SessionTokenBridge />
        <AuthQuerySync />
        <TenantProvider>{children}</TenantProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
