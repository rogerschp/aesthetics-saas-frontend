import { api } from "../client";
import { Service } from "../types";

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  durationInMinutes: number;
  isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export const catalogService = {
  list: async (tenantId: string): Promise<Service[]> => {
    const response = await api.get(`/tenants/${tenantId}/services`);
    return response as any;
  },

  create: async (tenantId: string, payload: CreateServiceDto): Promise<Service> => {
    const response = await api.post(`/tenants/${tenantId}/services`, payload);
    return response as any;
  },

  update: async (tenantId: string, serviceId: string, payload: UpdateServiceDto): Promise<Service> => {
    const response = await api.patch(`/tenants/${tenantId}/services/${serviceId}`, payload);
    return response as any;
  },

  delete: async (tenantId: string, serviceId: string): Promise<void> => {
    await api.delete(`/tenants/${tenantId}/services/${serviceId}`);
  },
};
