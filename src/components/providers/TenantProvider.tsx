"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/lib/api/services/users.service";
import { Membership, TenantUserRole } from "@/lib/api/types";

export const TENANT_STORAGE_KEY = "@barbershop:tenant";

interface TenantContextValue {
  memberships: Membership[];
  current: Membership | null;
  role: TenantUserRole | null;
  /** True enquanto sessão ou memberships ainda não estão confiáveis pra UI. */
  isLoading: boolean;
  /** Fetch em andamento (mesmo com dados antigos na tela). */
  isFetching: boolean;
  isError: boolean;
  setCurrentTenantId: (tenantId: string) => void;
  refetch: () => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

function readStoredTenantKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TENANT_STORAGE_KEY);
}

/** Aceita id (atual) ou slug (legado) e normaliza o storage para o UUID. */
function resolveStoredMembership(
  memberships: Membership[],
  stored: string | null,
): Membership | null {
  if (!stored) return null;
  return (
    memberships.find((m) => m.tenant.id === stored) ??
    memberships.find((m) => m.tenant.slug === stored) ??
    null
  );
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;

  const [currentTenantId, setCurrentTenantIdState] = useState<string | null>(
    null,
  );

  const {
    data,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me-tenants", userId],
    queryFn: () => usersService.getMyTenants(),
    enabled: isAuthenticated && !!userId,
    staleTime: 0,
    refetchOnMount: "always",
    // Free tier (Render/Neon) pode demorar no cold start.
    retry: 2,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 8000),
  });

  const memberships = useMemo(() => data ?? [], [data]);
  const hasResolved = data !== undefined;

  useEffect(() => {
    if (!userId) {
      setCurrentTenantIdState(null);
    }
  }, [userId]);

  useEffect(() => {
    if (memberships.length === 0) {
      setCurrentTenantIdState(null);
      return;
    }

    const stored = readStoredTenantKey();
    const matched = resolveStoredMembership(memberships, stored);
    const nextId = matched?.tenant.id ?? memberships[0].tenant.id;
    setCurrentTenantIdState(nextId);

    if (typeof window !== "undefined" && stored !== nextId) {
      window.localStorage.setItem(TENANT_STORAGE_KEY, nextId);
    }
  }, [memberships, userId]);

  const setCurrentTenantId = useCallback((tenantId: string) => {
    setCurrentTenantIdState(tenantId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
    }
  }, []);

  const current =
    memberships.find((m) => m.tenant.id === currentTenantId) ?? null;

  /**
   * Não mostrar "sem loja" enquanto ainda estamos buscando.
   * Caso clássico free-tier: cache [] + refetch lento → isPending false,
   * isFetching true → UI antiga mostrava empty e parecia "não re-renderizar".
   */
  const waitingForMemberships =
    isAuthenticated &&
    (!!userId) &&
    (!hasResolved || (isFetching && memberships.length === 0));

  const value: TenantContextValue = {
    memberships,
    current,
    role: current?.role ?? null,
    isLoading: status === "loading" || waitingForMemberships || isPending,
    isFetching: isAuthenticated && isFetching,
    isError: isAuthenticated && isError && hasResolved && !isFetching,
    setCurrentTenantId,
    refetch: () => {
      void refetch();
    },
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenantContext(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenantContext must be used within TenantProvider");
  }
  return ctx;
}
