import { api } from "../client";
import { Service } from "../types";

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  durationInMinutes: number;
  isActive?: boolean;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

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
