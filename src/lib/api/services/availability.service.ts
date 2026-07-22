import { api } from "../client";
import { WorkingHours, TimeOff, AvailabilityBlock, AvailableSlotsResponse } from "../types";

export interface BootstrapWorkingWeekDto {
  closedDays?: string[];
  periods: Array<{
    startTime: string;
    endTime: string;
  }>;
  overwriteExisting?: boolean;
}

export const availabilityService = {
  getAvailableSlots: async (tenantId: string, tpId: string, serviceId: string, date: string): Promise<AvailableSlotsResponse> => {
    const response = await api.get(`/tenants/${tenantId}/tenant-professionals/${tpId}/available-slots`, {
      params: { serviceId, date }
    });
    return response as any;
  },

  bootstrapWeek: async (tenantId: string, tpId: string, payload: BootstrapWorkingWeekDto): Promise<any> => {
    const response = await api.post(`/tenants/${tenantId}/tenant-professionals/${tpId}/working-hours/bootstrap-week`, payload);
    return response as any;
  },
};
