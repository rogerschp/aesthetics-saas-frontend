"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchBar } from "./SearchBar";
import { TenantSearchCard } from "./TenantSearchCard";
import { searchService } from "@/lib/api/services/search.service";
import { formatApiError } from "@/lib/api/errors";

interface Coords {
  lat: number;
  lng: number;
}

/** Parse "Cidade, UF" → { city, state }. Sem vírgula → só city. */
function parseLocation(raw: string): { city?: string; state?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  const match = trimmed.match(/^(.+?),\s*([A-Za-z]{2})$/);
  if (match) {
    return { city: match[1].trim(), state: match[2].toUpperCase() };
  }
  return { city: trimmed };
}

/**
 * Listagem da home.
 * Filtros vivem na URL (`?q=&city=&state=&lat=&lng=`).
 * Clicar em Início (rota sem query) → lista completa da região, não a última busca.
 */
export function HomeTenantSearch() {
  const t = useTranslations("Home");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const appliedLat = searchParams.get("lat");
  const appliedLng = searchParams.get("lng");

  const applied = useMemo(() => {
    const q = searchParams.get("q")?.trim() ?? "";
    const city = searchParams.get("city")?.trim() || undefined;
    const state = searchParams.get("state")?.trim().toUpperCase() || undefined;
    const coords =
      appliedLat != null &&
      appliedLng != null &&
      !Number.isNaN(Number(appliedLat)) &&
      !Number.isNaN(Number(appliedLng))
        ? { lat: Number(appliedLat), lng: Number(appliedLng) }
        : null;
    return { q, city, state, coords };
  }, [searchParams, appliedLat, appliedLng]);

  const [q, setQ] = useState(applied.q);
  const [location, setLocation] = useState(() => {
    if (applied.city && applied.state) return `${applied.city}, ${applied.state}`;
    return applied.city ?? "";
  });
  const [useGeo, setUseGeo] = useState(!!applied.coords);
  const [coords, setCoords] = useState<Coords | null>(applied.coords);
  const [geoLoading, setGeoLoading] = useState(false);

  // Ao voltar para Início sem query (ou limpar URL), reseta o formulário.
  useEffect(() => {
    setQ(applied.q);
    if (applied.city && applied.state) {
      setLocation(`${applied.city}, ${applied.state}`);
    } else {
      setLocation(applied.city ?? "");
    }
    setUseGeo(!!applied.coords);
    setCoords(applied.coords);
  }, [applied.q, applied.city, applied.state, appliedLat, appliedLng]);

  const hasFilter =
    !!applied.q || !!applied.city || !!applied.state || !!applied.coords;

  const searchQuery = useQuery({
    queryKey: [
      "search-tenants",
      applied.q,
      applied.city,
      applied.state,
      applied.coords,
    ],
    queryFn: () =>
      searchService.searchTenants({
        q: applied.q.length >= 2 ? applied.q : undefined,
        city: applied.city,
        state: applied.state,
        lat: applied.coords?.lat,
        lng: applied.coords?.lng,
        // Default do back é 10 km; com “perto de mim” ampliamos um pouco.
        radius: applied.coords ? 25 : undefined,
        limit: 24,
      }),
  });

  function pushFilters(next: {
    q?: string;
    city?: string;
    state?: string;
    coords?: Coords | null;
  }) {
    const params = new URLSearchParams();
    const nextQ = next.q?.trim() ?? "";
    if (nextQ.length >= 2) params.set("q", nextQ);
    if (next.city && next.city.trim().length >= 2) {
      params.set("city", next.city.trim());
    }
    if (next.state && next.state.trim().length === 2) {
      params.set("state", next.state.trim().toUpperCase());
    }
    if (next.coords) {
      params.set("lat", String(next.coords.lat));
      params.set("lng", String(next.coords.lng));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleGeo() {
    if (useGeo) {
      setUseGeo(false);
      setCoords(null);
      // Desliga e aplica na hora (remove lat/lng da URL).
      const loc = parseLocation(location);
      pushFilters({
        q: q.trim(),
        city: loc.city,
        state: loc.state,
        coords: null,
      });
      return;
    }
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(next);
        setUseGeo(true);
        setLocation("");
        setGeoLoading(false);
        // Aplica na hora — não exige clicar em Buscar.
        pushFilters({
          q: q.trim(),
          city: undefined,
          state: undefined,
          coords: next,
        });
      },
      () => {
        setUseGeo(false);
        setCoords(null);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 },
    );
  }

  function submit() {
    const loc = useGeo ? {} : parseLocation(location);
    pushFilters({
      q: q.trim(),
      city: loc.city,
      state: loc.state,
      coords: useGeo ? coords : null,
    });
  }

  const results = searchQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <SearchBar
          q={q}
          onQChange={setQ}
          location={location}
          onLocationChange={setLocation}
          useGeo={useGeo}
          onToggleGeo={toggleGeo}
          onSubmit={submit}
          loading={searchQuery.isFetching}
          geoLoading={geoLoading}
        />
      </div>

      <div>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {hasFilter ? t("results") : t("highlights")}
          </h2>
        </div>

        {searchQuery.isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {searchQuery.isError && (
          <p className="py-8 text-center text-sm text-destructive">
            {formatApiError(searchQuery.error)}
          </p>
        )}

        {!searchQuery.isLoading &&
          !searchQuery.isError &&
          results.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <SearchX className="h-10 w-10" />
              <p>{t("noResults")}</p>
            </div>
          )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((tenant) => (
              <TenantSearchCard key={tenant.id} tenant={tenant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
