import Image from "next/image";
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

  return (
    <div className="relative w-full h-[300px] md:h-[400px]">
      <div className="absolute inset-0 z-0">
        <Image
          src={estabelecimento.banner || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"}
          alt={estabelecimento.nome}
          fill
          className="object-cover brightness-[0.4]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">{estabelecimento.nome}</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">{estabelecimento.descricao}</p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center text-primary font-medium">
                <Star className="w-4 h-4 fill-primary mr-1" />
                <span>{averageRating}</span>
                <span className="text-muted-foreground ml-1 text-sm">({estabelecimento.avaliacoes.length} avaliações)</span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {estabelecimento.localizacao}
              </div>
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
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Denunciar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
