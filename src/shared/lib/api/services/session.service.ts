import { api } from "@/shared/lib/api/client";
import type { Membership, User } from "@/shared/lib/api/types";

/**
 * Session-scoped HTTP used by shared shell (Header, TenantProvider).
 * Same endpoints as features/user — kept in shared so shared ↛ features.
 */
export const sessionService = {
  getMe: async (): Promise<User> => api.get("/users/me"),

  getMyTenants: async (): Promise<Membership[]> => api.get("/users/me/tenants"),
};
