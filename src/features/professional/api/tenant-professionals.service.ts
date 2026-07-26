import { api } from "@/shared/lib/api/client";
import { TenantProfessional, PublicProfessional } from "@/shared/lib/api/types";
import { OfferedService } from "@/features/professional/model/professional.types";

export const tenantProfessionalsService = {
  /** GET /tenants/:tenantId/public/professionals — público (vitrine). */
  listPublic: async (tenantId: string): Promise<PublicProfessional[]> => {
    return api.get(`/tenants/${tenantId}/public/professionals`);
  },

  /** GET /tenants/:tenantId/tenant-professionals — membership. */
  list: async (
    tenantId: string,
    activeOnly = true,
  ): Promise<TenantProfessional[]> => {
    return api.get(`/tenants/${tenantId}/tenant-professionals`, {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
  },

  bindMe: async (tenantId: string): Promise<TenantProfessional> => {
    return api.post(`/tenants/${tenantId}/tenant-professionals/me`);
  },

  addOfferedServices: async (
    tenantId: string,
    tpId: string,
    serviceIds: string[],
  ): Promise<OfferedService[]> => {
    return Promise.all(
      serviceIds.map((serviceId) =>
        api.post<OfferedService>(
          `/tenants/${tenantId}/tenant-professionals/${tpId}/offered-services`,
          { serviceId },
        ),
      ),
    );
  },
};
