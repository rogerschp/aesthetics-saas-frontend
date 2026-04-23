import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressMapperProps {
  localizacao: string;
}

export function AddressMapper({ localizacao }: AddressMapperProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Localização
      </h3>
      
      <div className="rounded-xl overflow-hidden border border-border bg-card relative">
        <div className="h-[150px] w-full bg-black/40 flex items-center justify-center opacity-80"
             style={{
               backgroundImage: "radial-gradient(circle at center, rgba(50,50,50,0.8) 0%, rgba(10,10,10,1) 100%)",
             }}>
          <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-pulse border border-primary/50 flex items-center justify-center">
             <MapPin className="w-6 h-6 text-primary fill-primary/20" />
          </div>
        </div>
        
        <div className="p-4 flex items-center justify-between gap-4 bg-card/50 backdrop-blur-sm border-t border-border">
          <p className="text-sm text-card-foreground leading-relaxed">{localizacao}</p>
          <Button variant="secondary" size="sm" className="shrink-0 group">
            <Navigation className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            Rotas
          </Button>
        </div>
      </div>
    </div>
  );
}
