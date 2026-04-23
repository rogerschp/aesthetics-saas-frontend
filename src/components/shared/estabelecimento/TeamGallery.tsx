import { Membro } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamGalleryProps {
  time: Membro[];
}

export function TeamGallery({ time }: TeamGalleryProps) {
  if (!time || time.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Nossos Profissionais</h3>
      
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {time.map((membro) => (
          <div 
            key={membro.id} 
            className="snap-start shrink-0 w-[140px] md:w-[160px] flex flex-col items-center bg-card border border-border/40 rounded-xl p-4 hover:border-primary/50 transition-colors group cursor-pointer"
          >
            <Avatar className="w-20 h-20 mb-3 border-2 border-transparent group-hover:border-primary transition-colors">
              <AvatarImage src={membro.foto} alt={membro.nome} className="object-cover" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                {membro.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm text-center text-foreground group-hover:text-primary transition-colors line-clamp-1">{membro.nome}</span>
            <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-1">{membro.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
