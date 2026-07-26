import { TenantSegment } from "@/shared/lib/api/types";

// ============ Search ============
export interface TenantSearchResult {
  id: string;
  name: string;
  slug: string;
  segment: TenantSegment | null;
  avatarUrl: string | null;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  distanceKm: number | null;
  plan: {
    name: string;
    eliteBadge: boolean;
    regionalHighlight: boolean;
  };
}

export interface TenantSearchResponse {
  data: TenantSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
