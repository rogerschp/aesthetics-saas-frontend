import { Address, TenantSegment } from "@/shared/lib/api/types";

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// ============ Tenant ============
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  telephone: string;
  cnpj?: string | null;
  socialMedia?: Record<string, string> | null;
  address: Address | null;
  timezone: string;
  segment: TenantSegment | null;
  avatarUrl: string | null;
  logoMediaId?: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Política de cancelamento de CONFIRMED pelo cliente (default false). */
  clientCanCancelConfirmed: boolean;
  /** Antecedência mínima em minutos p/ cancelar confirmado (default 60; 0–43200). */
  clientCancelConfirmedMinLeadMinutes: number;
}
