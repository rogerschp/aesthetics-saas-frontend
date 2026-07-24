import { api } from "../client";
import { TenantThemeData, TenantThemeResponse } from "../types";

export const themeService = {
  /** GET /tenants/:tenantId/theme — público. theme null → usar defaults do front. */
  get: async (tenantId: string): Promise<TenantThemeResponse> => {
    return api.get(`/tenants/${tenantId}/theme`);
  },

  /** PUT /tenants/:tenantId/theme — OWNER/ADMIN; limites por plano. */
  upsert: async (
    tenantId: string,
    payload: TenantThemeData,
  ): Promise<TenantThemeResponse> => {
    return api.put(`/tenants/${tenantId}/theme`, payload);
  },

  /** DELETE /tenants/:tenantId/theme — restaura defaults. */
  delete: async (tenantId: string): Promise<{ message: string }> => {
    return api.delete(`/tenants/${tenantId}/theme`);
  },
};
