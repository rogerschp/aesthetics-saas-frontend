import { api } from "@/shared/lib/api/client";
import { Subscription } from "@/shared/lib/api/types";
import { Tenant } from "@/features/tenant/model/tenant.types";
import type { CreateTenantDto, UpdateTenantDto } from "@/features/tenant/api/dto/tenants.dto";

export type { CreateTenantDto, UpdateTenantDto };

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

  /**
   * GET /tenants/:tenantId/subscription — duplicado de
   * `subscriptionService.get` (feature `plans`), ADR-003: feature ↛ feature.
   * Usado só para saber se o tenant pode customizar o tema (TenantEditPage).
   */
  getSubscription: async (tenantId: string): Promise<Subscription> => {
    return api.get(`/tenants/${tenantId}/subscription`);
  },
};
