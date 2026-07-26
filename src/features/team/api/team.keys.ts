export const teamKeys = {
  members: (tenantId: string) => ["tenant-team-members", tenantId] as const,
  invitations: (tenantId: string) => ["tenant-team-invitations", tenantId] as const,
  /**
   * Mesma tupla de `tenantKeys.editTeam` (src/features/tenant/api/tenant.keys.ts).
   * Duplicada aqui (ADR-003: feature ↛ feature) para invalidar a query que o
   * TenantEditPage usa para carregar o time — precisa casar byte-a-byte.
   */
  editTeam: (tenantId?: string) => ["tenant-edit-team", tenantId] as const,
};
