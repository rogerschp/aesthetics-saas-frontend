import { NextRequest, NextResponse } from "next/server";

type NominatimItem = {
  lat: string;
  lon: string;
};

/**
 * Proxy Nominatim (CORS / User-Agent). Uso: geocodificar endereço do tenant
 * para lat/lng da busca "perto de mim".
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 5) {
    return NextResponse.json(
      { error: "Informe q com pelo menos 5 caracteres." },
      { status: 400 },
    );
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("q", q);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "CyacsysBarbershop/1.0 (local-dev; geocode)",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Falha ao geocodificar." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as NominatimItem[];
    const hit = data[0];
    if (!hit) {
      return NextResponse.json({ latitude: null, longitude: null });
    }

    return NextResponse.json({
      latitude: Number(hit.lat),
      longitude: Number(hit.lon),
    });
  } catch {
    return NextResponse.json(
      { error: "Falha ao geocodificar." },
      { status: 502 },
    );
  }
}
