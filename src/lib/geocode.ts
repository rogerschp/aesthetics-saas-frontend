import type { Address } from "@/lib/api/types";

export type GeoCoords = { latitude: number; longitude: number };

/** Monta query para Nominatim a partir do endereço estruturado. */
export function addressToGeocodeQuery(address: Address): string {
  const parts = [
    [address.street, address.number].filter(Boolean).join(" "),
    address.city,
    address.state,
    address.zipCode,
    address.country || "Brazil",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Geocodifica via `/api/geocode` (proxy Nominatim). Retorna null se não achar. */
export async function geocodeAddress(
  address: Address,
): Promise<GeoCoords | null> {
  const q = addressToGeocodeQuery(address);
  if (q.length < 5) return null;

  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    latitude?: number | null;
    longitude?: number | null;
  };

  if (
    typeof data.latitude === "number" &&
    typeof data.longitude === "number" &&
    !Number.isNaN(data.latitude) &&
    !Number.isNaN(data.longitude)
  ) {
    return { latitude: data.latitude, longitude: data.longitude };
  }
  return null;
}
