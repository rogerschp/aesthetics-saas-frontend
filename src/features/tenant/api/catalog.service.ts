import { api } from "@/shared/lib/api/client";
import { Service } from "@/shared/lib/api/types";
import type { CreateServiceDto, UpdateServiceDto } from "@/features/tenant/api/dto/catalog.dto";

export type { CreateServiceDto, UpdateServiceDto };

export const catalogService = {
  /** GET /tenants/:tenantId/public/services — público (vitrine). */
  listPublic: async (tenantId: string): Promise<Service[]> => {
    return api.get(`/tenants/${tenantId}/public/services`);
  },

  list: async (tenantId: string): Promise<Service[]> => {
    return api.get(`/tenants/${tenantId}/services`);
  },

  create: async (tenantId: string, payload: CreateServiceDto): Promise<Service> => {
    return api.post(`/tenants/${tenantId}/services`, payload);
  },

  update: async (tenantId: string, serviceId: string, payload: UpdateServiceDto): Promise<Service> => {
    return api.patch(`/tenants/${tenantId}/services/${serviceId}`, payload);
  },

  delete: async (tenantId: string, serviceId: string): Promise<void> => {
    await api.delete(`/tenants/${tenantId}/services/${serviceId}`);
  },
};
