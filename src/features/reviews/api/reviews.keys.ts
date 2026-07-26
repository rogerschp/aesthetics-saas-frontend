export const reviewsKeys = {
  tenant: (tenantId: string) => ["tenant-reviews", tenantId] as const,
  /** Mesmo endpoint que professionalKeys.reviews (feature professional) — literal igual. */
  professional: (userId: string) => ["professional-reviews", userId] as const,
};
