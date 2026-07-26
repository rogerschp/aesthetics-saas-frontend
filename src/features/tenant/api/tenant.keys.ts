export const tenantKeys = {
  edit: (tenantId?: string) => ["tenant-edit", tenantId] as const,
  editServices: (tenantId?: string) => ["tenant-edit-services", tenantId] as const,
  editTeam: (tenantId?: string) => ["tenant-edit-team", tenantId] as const,
  /** Prefixo usado para invalidar o expediente independente do tpId. */
  editHoursAll: (tenantId?: string) => ["tenant-edit-hours", tenantId] as const,
  editHours: (tenantId?: string, tpId?: string | null) =>
    ["tenant-edit-hours", tenantId, tpId] as const,
  editTheme: (tenantId?: string) => ["tenant-edit-theme", tenantId] as const,
  /**
   * Mesma tupla de `plansKeys.subscription` (src/features/plans/api/plans.keys.ts).
   * Duplicada aqui (ADR-003: feature ↛ feature) — precisa casar byte-a-byte
   * para compartilhar a identidade de cache com o SubscriptionCard.
   */
  subscription: (tenantId?: string) => ["subscription", tenantId] as const,
};
