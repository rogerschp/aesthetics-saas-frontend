/**
 * Query keys for the session-scoped endpoints (`/users/me`, `/users/me/tenants`).
 * Lives in shared (not a feature) because Header/TenantProvider must not import
 * from features. Some features (user, professional) hit the same endpoints
 * through their own service copies and reuse these keys to keep cache identity.
 */
export const sessionKeys = {
  me: (userId?: string) => ["me", userId] as const,
  tenantsAll: ["me-tenants"] as const,
  tenants: (userId?: string) => ["me-tenants", userId] as const,
};
