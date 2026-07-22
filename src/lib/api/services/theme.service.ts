import { api } from "../client";
import { TenantThemeData, TenantThemeResponse } from "../types";

export const themeService = {
  /** GET /tenants/:tenantId/theme — público. theme null → usar defaults do front. */
  get: async (tenantId: string): Promise<TenantThemeResponse> => {
    const response = await api.get(`/tenants/${tenantId}/theme`);
    return response as any;
  },

  /** PUT /tenants/:tenantId/theme — OWNER/ADMIN; limites por plano. */
  upsert: async (
    tenantId: string,
    payload: TenantThemeData,
  ): Promise<TenantThemeResponse> => {
    const response = await api.put(`/tenants/${tenantId}/theme`, payload);
    return response as any;
  },

  /** DELETE /tenants/:tenantId/theme — restaura defaults. */
  delete: async (tenantId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tenants/${tenantId}/theme`);
    return response as any;
  },
};
