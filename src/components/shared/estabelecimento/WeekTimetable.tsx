import { Horario } from "@/types";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekTimetableProps {
  horarios: Horario[];
}

const DIAS_DA_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
];

export function WeekTimetable({ horarios }: WeekTimetableProps) {
  if (!horarios || horarios.length === 0) return null;

  const hoje = new Date().getDay();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Horários de Funcionamento
      </h3>
      
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="space-y-3">
          {horarios.map((horario) => {
            const isToday = horario.diaDaSemana === hoje;
            
            return (
              <div 
                key={horario.diaDaSemana} 
                className={cn(
                  "flex justify-between items-center py-2 text-sm border-b border-border/30 last:border-0",
                  isToday ? "font-medium text-primary" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{DIAS_DA_SEMANA[horario.diaDaSemana]}</span>
                  {isToday && <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">Hoje</span>}
                </div>
                
                <span className={cn(
                  horario.fechado ? "text-destructive/80 font-medium" : "text-card-foreground"
                )}>
                  {horario.fechado ? "Fechado" : `${horario.inicio} - ${horario.fim}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
