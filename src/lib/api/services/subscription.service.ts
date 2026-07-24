import { api } from "../client";
import { Subscription, SubscriptionHistoryEvent } from "../types";

export const subscriptionService = {
  /** GET /tenants/:tenantId/subscription — OWNER/ADMIN/STAFF. */
  get: async (tenantId: string): Promise<Subscription> => {
    return api.get(`/tenants/${tenantId}/subscription`);
  },

  /** GET /tenants/:tenantId/subscription/history. */
  history: async (tenantId: string): Promise<SubscriptionHistoryEvent[]> => {
    return api.get(`/tenants/${tenantId}/subscription/history`);
  },
};
