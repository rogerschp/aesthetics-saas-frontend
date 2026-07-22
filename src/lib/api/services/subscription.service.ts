import { api } from "../client";
import { Subscription, SubscriptionHistoryEvent } from "../types";

export const subscriptionService = {
  /** GET /tenants/:tenantId/subscription — OWNER/ADMIN/STAFF. */
  get: async (tenantId: string): Promise<Subscription> => {
    const response = await api.get(`/tenants/${tenantId}/subscription`);
    return response as any;
  },

  /** GET /tenants/:tenantId/subscription/history. */
  history: async (tenantId: string): Promise<SubscriptionHistoryEvent[]> => {
    const response = await api.get(`/tenants/${tenantId}/subscription/history`);
    return response as any;
  },
};
