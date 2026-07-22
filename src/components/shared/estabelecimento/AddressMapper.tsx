import { MapPin, Navigation } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddressMapperProps {
  localizacao: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function AddressMapper({
  localizacao,
  latitude,
  longitude,
}: AddressMapperProps) {
  const hasCoords =
    typeof latitude === "number" && typeof longitude === "number";

  const mapsSearchHref = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : localizacao
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localizacao)}`
      : null;

  // Embed: coords precisas ou busca por texto (sem API key).
  const embedSrc = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : localizacao
      ? `https://maps.google.com/maps?q=${encodeURIComponent(localizacao)}&z=15&output=embed`
      : null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-5 w-5 text-primary" />
        Localização
      </h3>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {embedSrc ? (
          <iframe
            title="Mapa do estabelecimento"
            src={embedSrc}
            className="h-[200px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="relative flex h-[150px] w-full items-center justify-center bg-black/40 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(50,50,50,0.8) 0%, rgba(10,10,10,1) 100%)",
            }}
          >
            <div className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-primary/20">
              <MapPin className="h-6 w-6 fill-primary/20 text-primary" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-border bg-card/50 p-4 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-card-foreground">
            {localizacao || "Endereço ainda não cadastrado."}
          </p>
          {mapsSearchHref && (
            <a
              href={mapsSearchHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "shrink-0",
              )}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Rotas
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
