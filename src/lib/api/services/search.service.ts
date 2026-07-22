import { api } from "../client";
import { TenantSearchResponse, TenantSegment } from "../types";

export interface SearchTenantsParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  /** Cidade (parcial, sem acento). Mín. 2 chars no back. */
  city?: string;
  /** UF com 2 letras (ex.: SP). */
  state?: string;
  segment?: TenantSegment;
  page?: number;
  limit?: number;
}

export const searchService = {
  /** GET /search/tenants — público. q min 2; lat+lng juntos; radius máx 50; city/state. */
  searchTenants: async (
    params: SearchTenantsParams = {},
  ): Promise<TenantSearchResponse> => {
    const query: Record<string, string | number> = {};
    if (params.q && params.q.trim().length >= 2) query.q = params.q.trim();
    if (params.lat != null && params.lng != null) {
      query.lat = params.lat;
      query.lng = params.lng;
    }
    if (params.radius != null) query.radius = params.radius;
    if (params.city && params.city.trim().length >= 2) {
      query.city = params.city.trim();
    }
    if (params.state && params.state.trim().length === 2) {
      query.state = params.state.trim().toUpperCase();
    }
    if (params.segment) query.segment = params.segment;
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;

    const response = await api.get(`/search/tenants`, { params: query });
    return response as any;
  },
};
