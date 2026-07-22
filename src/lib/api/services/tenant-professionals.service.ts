import { api } from "../client";
import { TenantProfessional, OfferedService, PublicProfessional } from "../types";

export const tenantProfessionalsService = {
  /** GET /tenants/:tenantId/public/professionals — público (vitrine). */
  listPublic: async (tenantId: string): Promise<PublicProfessional[]> => {
    const response = await api.get(`/tenants/${tenantId}/public/professionals`);
    return response as any;
  },

  /** GET /tenants/:tenantId/tenant-professionals — membership. */
  list: async (
    tenantId: string,
    activeOnly = true,
  ): Promise<TenantProfessional[]> => {
    const response = await api.get(`/tenants/${tenantId}/tenant-professionals`, {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
    return response as any;
  },

  bindMe: async (tenantId: string): Promise<TenantProfessional> => {
    const response = await api.post(`/tenants/${tenantId}/tenant-professionals/me`);
    return response as any;
  },

  addOfferedServices: async (tenantId: string, tpId: string, serviceIds: string[]): Promise<OfferedService[]> => {
    const promises = serviceIds.map(serviceId => 
      api.post(`/tenants/${tenantId}/tenant-professionals/${tpId}/offered-services`, { serviceId })
    );
    const results = await Promise.all(promises);
    return results as any;
  },
};
