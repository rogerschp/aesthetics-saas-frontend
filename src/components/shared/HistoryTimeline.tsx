import { Usuario } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Store } from "lucide-react";
import Link from "next/link";

interface HistoryTimelineProps {
  historico: Usuario["historico"];
}

export function HistoryTimeline({ historico }: HistoryTimelineProps) {
  if (!historico || historico.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <Store className="h-6 w-6 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-white">Nenhum serviço ainda</h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm">
          Você ainda não realizou nenhum agendamento pelo BarberShop.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 sm:p-8 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-6">Histórico de Atendimentos</h3>
      
      <div className="relative border-l border-zinc-800 ml-3 space-y-8 pb-4">
        {historico.map((item, index) => {
          const date = new Date(item.data);
          return (
            <div key={index} className="relative pl-8">
              {/* Timeline dot */}
              <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {item.servicoNome}
                  </h4>
                  <Link 
                    href={`/barbearia/${item.barbeariaSlug}`}
                    className="inline-flex items-center mt-1 text-sm text-zinc-400 hover:text-yellow-500 transition-colors"
                  >
                    <Store className="mr-1.5 h-3.5 w-3.5" />
                    {item.barbeariaNome}
                  </Link>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-800/40 px-2.5 py-1 rounded-md self-start">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500/80" />
                  <span className="capitalize">
                    {format(date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
