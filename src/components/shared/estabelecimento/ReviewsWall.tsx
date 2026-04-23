import { Avaliacao } from "@/types";
import { Star, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewsWallProps {
  avaliacoes: Avaliacao[];
}

export function ReviewsWall({ avaliacoes }: ReviewsWallProps) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        Avaliações de Clientes
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {avaliacoes.map((avaliacao) => (
          <div key={avaliacao.id} className="bg-card border border-border/40 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={avaliacao.usuario.foto} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {avaliacao.usuario.nome.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{avaliacao.usuario.nome}</p>
                  <div className="flex items-center mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < avaliacao.nota ? "fill-primary text-primary" : "fill-muted text-muted"}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              &quot;{avaliacao.comentario}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
