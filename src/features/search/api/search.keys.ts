export const searchKeys = {
  highlights: ["search-tenants-highlights"] as const,
  results: (
    q?: string,
    city?: string,
    state?: string,
    coords?: { lat: number; lng: number } | null,
  ) => ["search-tenants", q, city, state, coords] as const,
};
