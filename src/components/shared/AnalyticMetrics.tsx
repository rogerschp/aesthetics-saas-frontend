import { Usuario } from "@/types";
import { Scissors, Star } from "lucide-react";

interface AnalyticMetricsProps {
  usuario: Usuario;
}

export function AnalyticMetrics({ usuario }: AnalyticMetricsProps) {
  const { estatisticas } = usuario;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-sm font-medium text-zinc-400 mb-1">Serviços Realizados</p>
          <p className="text-4xl font-bold text-white">{estatisticas.totalServicos}</p>
        </div>
        <div className="h-14 w-14 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 relative z-10 shrink-0">
          <Scissors className="h-7 w-7 text-yellow-500" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full group-hover:bg-yellow-500/20 transition-colors"></div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-sm font-medium text-zinc-400 mb-1">Avaliações</p>
          <p className="text-4xl font-bold text-white">{estatisticas.totalAvaliacoes}</p>
        </div>
        <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 relative z-10 shrink-0">
          <Star className="h-7 w-7 text-white fill-white/20" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-zinc-500/10 blur-2xl rounded-full group-hover:bg-zinc-500/20 transition-colors"></div>
      </div>
    </div>
  );
}
