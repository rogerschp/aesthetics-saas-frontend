import { Star, MapPin, Globe, Share2, AlertTriangle } from "lucide-react";
import { Estabelecimento } from "@/types";
import { Button } from "@/components/ui/button";

interface EstabelecimentoBannerProps {
  estabelecimento: Estabelecimento;
}

export function EstabelecimentoBanner({ estabelecimento }: EstabelecimentoBannerProps) {
  const averageRating = estabelecimento.avaliacoes.length
    ? (estabelecimento.avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / estabelecimento.avaliacoes.length).toFixed(1)
    : "Novo";

  const heroSrc =
    estabelecimento.banner ||
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop";

  return (
    <div className="relative w-full h-[300px] md:h-[400px]">
      <div className="absolute inset-0 z-0">
        {/* img nativo: Cloudinary e CDNs sem whitelisting quebram next/image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt={estabelecimento.nome}
          className="h-full w-full object-cover brightness-[0.45]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">{estabelecimento.nome}</h1>
            {estabelecimento.segmentoLabel && (
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {estabelecimento.segmentoLabel}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center font-medium text-primary">
                <Star className="mr-1 h-4 w-4 fill-primary" />
                <span>{averageRating}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  ({estabelecimento.avaliacoes.length} avaliações)
                </span>
              </div>
              {estabelecimento.localizacao && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {estabelecimento.localizacao}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {estabelecimento.redesSociais.instagram && (
              <Button variant="outline" size="icon" className="rounded-full bg-black/50 border-white/10 hover:bg-white/10 hover:text-primary transition-colors">
                <Globe className="w-4 h-4" />
              </Button>
            )}
             {estabelecimento.redesSociais.facebook && (
              <Button variant="outline" size="icon" className="rounded-full bg-black/50 border-white/10 hover:bg-white/10 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive inline-flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="hidden sm:inline leading-none">Denunciar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
