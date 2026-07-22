import { Horario } from "@/types";
import type { VarianteComponente } from "@/types";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekTimetableProps {
  horarios: Horario[];
  variante?: VarianteComponente;
}

const DIAS_DA_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
];

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * WeekTimetable
 *
 * Exibição dos horários de funcionamento com 3 variantes visuais:
 * - padrão: Tabela semanal vertical (layout original)
 * - alternativo: Barras visuais horizontais representando as horas
 * - compacto: Grid de cards compactos (um por dia)
 */
export function WeekTimetable({ horarios, variante = "padrao" }: WeekTimetableProps) {
  if (!horarios || horarios.length === 0) return null;

  const hoje = new Date().getDay();

  // Variante Padrão: Tabela semanal (original)
  if (variante === "padrao") {
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

  // Variante Alternativo: Barras visuais de horário
  if (variante === "alternativo") {
    /** Converte "HH:MM" em fração do dia (0-1) para visualização de barra */
    const horaParaFracao = (hora: string) => {
      const [h, m] = hora.split(":").map(Number);
      return (h + m / 60) / 24;
    };

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Horários de Funcionamento
        </h3>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          {/* Escala de horas */}
          <div className="flex justify-between text-[10px] text-muted-foreground px-1 mb-1">
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>24h</span>
          </div>

          {horarios.map((horario) => {
            const isToday = horario.diaDaSemana === hoje;
            const inicio = horario.fechado ? 0 : horaParaFracao(horario.inicio);
            const fim = horario.fechado ? 0 : horaParaFracao(horario.fim);
            // Normalizar para escala visual (6h-24h = faixa útil)
            const escalaInicio = Math.max(0, (inicio - 0.25) / 0.75) * 100;
            const escalaLargura = Math.max(0, ((fim - inicio) / 0.75) * 100);

            return (
              <div key={horario.diaDaSemana} className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs w-8 shrink-0 text-right",
                    isToday ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {DIAS_CURTOS[horario.diaDaSemana]}
                </span>
                <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden relative">
                  {!horario.fechado ? (
                    <div
                      className={cn(
                        "absolute top-0 h-full rounded-full transition-all",
                        isToday ? "bg-primary/60" : "bg-primary/30"
                      )}
                      style={{ left: `${escalaInicio}%`, width: `${escalaLargura}%` }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] text-destructive/60 font-medium">Fechado</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Variante Compacto: Grid de cards por dia
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Horários de Funcionamento
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {horarios.map((horario) => {
          const isToday = horario.diaDaSemana === hoje;

          return (
            <div
              key={horario.diaDaSemana}
              className={cn(
                "p-3 rounded-xl border text-center transition-colors",
                isToday
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/40 bg-card",
                horario.fechado && "opacity-50"
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold block mb-1",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}
              >
                {DIAS_CURTOS[horario.diaDaSemana]}
                {isToday && " •"}
              </span>
              <span
                className={cn(
                  "text-sm block",
                  horario.fechado
                    ? "text-destructive/70"
                    : "text-card-foreground font-medium"
                )}
              >
                {horario.fechado ? "Fechado" : `${horario.inicio} - ${horario.fim}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
