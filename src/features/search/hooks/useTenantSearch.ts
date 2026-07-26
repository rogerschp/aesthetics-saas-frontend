"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchService } from "@/features/search/api/search.service";
import { searchKeys } from "@/features/search/api/search.keys";

/** GET /search/tenants?regionalHighlight=true — usado por HomeTenantSearch (sem filtro). */
export function useTenantHighlights(enabled: boolean) {
  return useQuery({
    queryKey: searchKeys.highlights,
    queryFn: () =>
      searchService.searchTenants({ regionalHighlight: true, limit: 10 }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/** GET /search/tenants?... — usado por HomeTenantSearch (com filtro). */
export function useTenantSearch(
  q: string,
  city: string | undefined,
  state: string | undefined,
  coords: { lat: number; lng: number } | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: searchKeys.results(q, city, state, coords),
    queryFn: () =>
      searchService.searchTenants({
        q: q.length >= 2 ? q : undefined,
        city,
        state,
        lat: coords?.lat,
        lng: coords?.lng,
        radius: coords ? 25 : undefined,
        limit: 24,
      }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
