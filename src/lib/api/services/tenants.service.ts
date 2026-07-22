import { api } from "../client";
import { Tenant } from "../types";

export interface CreateTenantDto {
  name: string;
  slug?: string;
  telephone: string;
  cnpj?: string;
  socialMedia?: Record<string, string>;
  address?: any;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {
  status?: string;
  timezone?: string;
}

export const tenantsService = {
  validateSlug: async (slug: string): Promise<{ available: boolean; reason?: string }> => {
    const response = await api.get(`/tenants/validate-slug`, { params: { slug } });
    return response as any; // interceptor unwrap
  },

  getById: async (id: string): Promise<Tenant> => {
    const response = await api.get(`/tenants/by-id/${id}`);
    return response as any;
  },

  getBySlug: async (slug: string): Promise<Tenant> => {
    const response = await api.get(`/tenants/by-slug/${slug}`);
    return response as any;
  },

  create: async (payload: CreateTenantDto): Promise<Tenant> => {
    const response = await api.post(`/tenants`, payload);
    return response as any;
  },

  createWithOwner: async (payload: CreateTenantDto): Promise<Tenant> => {
    const response = await api.post(`/tenants/with-owner`, payload);
    return response as any;
  },

  update: async (id: string, payload: UpdateTenantDto): Promise<Tenant> => {
    const response = await api.patch(`/tenants/${id}`, payload);
    return response as any;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },
};
