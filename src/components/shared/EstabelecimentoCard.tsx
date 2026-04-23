import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Estabelecimento } from "@/types";

interface EstabelecimentoCardProps {
  estabelecimento: Estabelecimento;
}

export function EstabelecimentoCard({ estabelecimento }: EstabelecimentoCardProps) {
  // Pega a média de notas de forma segura
  const mediaAvaliacoes = estabelecimento.avaliacoes?.length
    ? (estabelecimento.avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / estabelecimento.avaliacoes.length).toFixed(1)
    : "Novo";

  return (
    <Link href={`/estabelecimento/${estabelecimento.slug}`}>
      <Card className="group p-0 gap-0 overflow-hidden bg-card border-border transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] cursor-pointer h-full flex flex-col rounded-xl">
        {/* Area do Banner com suporte GPU para n vazar rendering embaixo do degradê */}
        <div className="relative h-48 w-full overflow-hidden bg-muted transform-gpu">
          {estabelecimento.banner ? (
            <img
              src={estabelecimento.banner}
              alt={`Capa do estabelecimento ${estabelecimento.nome}`}
              className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center">
              <span className="text-zinc-600 font-medium">Falta Imagem</span>
            </div>
          )}

          {/* Degradê encapsulado com cor Preta Forte/Invasiva para delimitar imagem e card */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 via-40% to-transparent pointer-events-none" />

          {/* Avatar da logo do estabelecimento com forte destaque simulando sombra pesada pra desgrudar do fundo */}
          <div className="absolute bottom-4 left-5 border-4 border-card bg-card rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-20">
            <Avatar className="h-16 w-16">
              {/* Usa o banner como fallback de avatar pro MVP estético */}
              <AvatarImage src={estabelecimento.banner} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                {estabelecimento.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Textos Informativos */}
        <CardContent className="p-5 pt-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground line-clamp-1">{estabelecimento.nome}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1.5 gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{estabelecimento.localizacao}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md shrink-0">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm font-bold text-foreground">{mediaAvaliacoes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
