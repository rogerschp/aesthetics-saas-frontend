import { Agendamento } from "@/types";
import { Calendar, Clock, MapPin, ExternalLink, Scissors } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface UpcomingAppointmentsProps {
  agendamentos: Agendamento[];
}

export function UpcomingAppointments({ agendamentos }: UpcomingAppointmentsProps) {
  if (!agendamentos || agendamentos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-white">Próximos Agendamentos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agendamentos.map((item) => {
          const date = new Date(item.data);
          return (
            <div 
              key={item.id} 
              className="group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 hover:border-yellow-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4 h-12">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                      <Scissors className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden">
                      <h4 className="font-bold text-white group-hover:text-yellow-500 transition-colors uppercase text-[10px] tracking-widest line-clamp-1">
                        {item.servicoNome}
                      </h4>
                      <Link 
                        href={`/barbearia/${item.barbeariaSlug}`}
                        className="text-zinc-400 text-xs hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate">{item.barbeariaNome}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </Link>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 capitalize font-bold text-[9px] shrink-0">
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-2 text-xs text-zinc-300 whitespace-nowrap">
                    <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="capitalize">{format(date, "eeee, dd 'de' MMM", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300 whitespace-nowrap rounded-lg bg-zinc-800/50 px-2 py-1">
                    <Clock className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                    <span className="font-bold">{format(date, "HH:mm")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-[11px] text-zinc-500 relative z-10">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{item.localizacao}</span>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full group-hover:bg-yellow-500/10 transition-colors"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
