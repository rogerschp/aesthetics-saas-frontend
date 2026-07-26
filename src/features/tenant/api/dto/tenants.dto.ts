import type { Address, TenantSegment } from "@/shared/lib/api/types";
import type { TenantStatus } from "@/features/tenant/model/tenant.types";

export interface CreateTenantDto {
  name: string;
  slug?: string;
  telephone: string;
  cnpj?: string;
  socialMedia?: Record<string, string>;
  address?: Address;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {
  status?: TenantStatus;
  timezone?: string;
  segment?: TenantSegment | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Política de cancelamento de confirmado pelo cliente (OWNER/ADMIN). */
  clientCanCancelConfirmed?: boolean;
  /** Antecedência mínima (min) 0–43200. */
  clientCancelConfirmedMinLeadMinutes?: number;
}
