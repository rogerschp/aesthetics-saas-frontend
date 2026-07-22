"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

/**
 * Guard client-side para o grupo (auth). Redireciona para /login quando não há
 * sessão válida e força novo login quando o refresh token falha
 * (session.error === 'RefreshAccessTokenError').
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      queryClient.clear();
      const callbackUrl = encodeURIComponent(pathname || "/painel");
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (session?.error === "RefreshAccessTokenError") {
      queryClient.clear();
      signOut({ callbackUrl: "/login" });
    }
  }, [status, session?.error, router, pathname, queryClient]);

  if (status !== "authenticated" || session?.error === "RefreshAccessTokenError") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
