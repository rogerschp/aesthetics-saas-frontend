"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/lib/api/services/users.service";
import { Membership, TenantUserRole } from "@/lib/api/types";

const STORAGE_KEY = "@barbershop:tenant";

interface TenantContextValue {
  memberships: Membership[];
  current: Membership | null;
  role: TenantUserRole | null;
  isLoading: boolean;
  isError: boolean;
  setCurrentTenantId: (tenantId: string) => void;
  refetch: () => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;

  const [currentTenantId, setCurrentTenantIdState] = useState<string | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me-tenants", userId],
    queryFn: () => usersService.getMyTenants(),
    enabled: isAuthenticated && !!userId,
  });

  const memberships = useMemo(() => data ?? [], [data]);

  // Limpa seleção local ao trocar de usuário / logout.
  useEffect(() => {
    if (!userId) {
      setCurrentTenantIdState(null);
    }
  }, [userId]);

  // Resolve o tenant atual: localStorage → primeira membership.
  useEffect(() => {
    if (memberships.length === 0) {
      setCurrentTenantIdState(null);
      return;
    }
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    const exists = stored && memberships.some((m) => m.tenant.id === stored);
    setCurrentTenantIdState(exists ? stored : memberships[0].tenant.id);
  }, [memberships, userId]);

  function setCurrentTenantId(tenantId: string) {
    setCurrentTenantIdState(tenantId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, tenantId);
    }
  }

  const current =
    memberships.find((m) => m.tenant.id === currentTenantId) ?? null;

  const value: TenantContextValue = {
    memberships,
    current,
    role: current?.role ?? null,
    isLoading: isAuthenticated && isLoading,
    isError,
    setCurrentTenantId,
    refetch,
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
