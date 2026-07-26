export const plansKeys = {
  list: ["plans"] as const,
  /** Mesmo endpoint que reportsKeys.subscription (feature reports) — literal igual. */
  subscription: (tenantId?: string) => ["subscription", tenantId] as const,
};
