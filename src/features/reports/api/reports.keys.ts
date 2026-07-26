export const reportsKeys = {
  /** Mesmo endpoint que plansKeys.subscription (feature plans) — literal igual. */
  subscription: (tenantId?: string) => ["subscription", tenantId] as const,
  tenantReport: (
    tenantId?: string,
    tier?: string,
    months?: number | null,
  ) => ["tenant-report", tenantId, tier, months] as const,
};
