import { api } from "../client";
import { Tenant, TenantSegment, TenantStatus, Address } from "../types";

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

export const tenantsService = {
  validateSlug: async (slug: string): Promise<{ available: boolean; reason?: string }> => {
    return api.get(`/tenants/validate-slug`, { params: { slug } }); // interceptor unwrap
  },

  getById: async (id: string): Promise<Tenant> => {
    return api.get(`/tenants/by-id/${id}`);
  },

  getBySlug: async (slug: string): Promise<Tenant> => {
    return api.get(`/tenants/by-slug/${slug}`);
  },

  create: async (payload: CreateTenantDto): Promise<Tenant> => {
    return api.post(`/tenants`, payload);
  },

  createWithOwner: async (payload: CreateTenantDto): Promise<Tenant> => {
    return api.post(`/tenants/with-owner`, payload);
  },

  update: async (id: string, payload: UpdateTenantDto): Promise<Tenant> => {
    return api.patch(`/tenants/${id}`, payload);
  },

  /** PATCH /tenants/:id/logo — vincula LOGO ({ mediaId }). */
  setLogo: async (id: string, mediaId: string): Promise<Tenant> => {
    return api.patch(`/tenants/${id}/logo`, { mediaId });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },
};
