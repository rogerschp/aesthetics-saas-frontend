import { api } from "../client";
import { TenantProfessional, OfferedService } from "../types";

export const tenantProfessionalsService = {
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
