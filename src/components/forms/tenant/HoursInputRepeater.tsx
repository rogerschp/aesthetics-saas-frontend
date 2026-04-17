"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";


const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
];

export function HoursInputRepeater() {
  const { control, register, watch } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: "horarios",
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Clock className="h-5 w-5 text-yellow-500" />
          Expediente
        </h3>
        <p className="text-sm text-zinc-400">
          Configure os dias e horários em que a unidade estará aberta para agendamentos.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        {fields.map((item, index) => {
          const isFechado = watch(`horarios.${index}.fechado`);

          return (
            <div 
              key={item.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                isFechado 
                  ? "border-zinc-800/40 bg-zinc-900/20 opacity-60" 
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center gap-4 min-w-[200px]">
                {/* Fallback simples usando um hidden input + toggle visual customizado pra evitar usar shadcn Switch que talvez não tenhamos */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    {...register(`horarios.${index}.fechado`)}
                  />
                  <div className="w-11 h-6 bg-yellow-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-yellow-500 after:border-yellow-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-700 peer-checked:after:bg-zinc-400 peer-checked:after:border-zinc-400"></div>
                </label>
                <div className="flex flex-col">
                  <span className={`font-bold ${isFechado ? "text-zinc-500 line-through" : "text-white"}`}>
                    {DIAS_SEMANA[index]}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {isFechado ? "Fechado" : "Aberto"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    disabled={isFechado}
                    className="w-[120px] bg-black border-zinc-800 focus-visible:ring-yellow-500/50 disabled:opacity-50"
                    {...register(`horarios.${index}.inicio`)}
                  />
                  <span className="text-zinc-500 font-medium">até</span>
                  <Input
                    type="time"
                    disabled={isFechado}
                    className="w-[120px] bg-black border-zinc-800 focus-visible:ring-yellow-500/50 disabled:opacity-50"
                    {...register(`horarios.${index}.fim`)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
