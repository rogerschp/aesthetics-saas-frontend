import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  return (
    <div className="flex flex-col sm:flex-row items-center w-full max-w-3xl gap-2 bg-card p-2 rounded-xl border border-border shadow-2xl">
      <div className="relative flex-[1.5] w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Busque por estabelecimento ou serviço..."
          className="pl-10 border-none bg-transparent focus-visible:ring-0 shadow-none text-base h-12"
        />
      </div>
      <div className="hidden sm:block w-px h-8 bg-border" />
      <div className="relative flex-1 w-full">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Localização..." 
          className="pl-10 border-none bg-transparent focus-visible:ring-0 shadow-none text-base h-12"
        />
      </div>
      <Button size="lg" className="w-full sm:w-auto px-8 h-12 rounded-lg font-bold text-base shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all">
        Buscar
      </Button>
    </div>
  );
}
