"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Users, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamBuilder() {
  const { control, register, watch } = useFormContext();
  const { fields: team, append, remove } = useFieldArray({
    control,
    name: "time",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-yellow-500" />
            Equipe & Profissionais
          </h3>
          <p className="text-sm text-zinc-400">
            Cadastre os barbeiros, tatuadores e demais membros da sua equipe.
          </p>
        </div>
        <Button 
          type="button" 
          onClick={() => append({ nome: "", role: "", foto: "" })}
          className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Membro
        </Button>
      </div>

      <div className="space-y-4 pt-4">
        {team.map((member, index) => {
          const fotoWatch = watch(`time.${index}.foto`);
          const nomeWatch = watch(`time.${index}.nome`) || "Novo Membro";
          
          return (
            <div key={member.id} className="flex gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 items-start group">
              <div className="pt-2 text-zinc-700 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
              </div>
              
              <Avatar className="h-14 w-14 border border-zinc-700">
                <AvatarImage src={fotoWatch} alt="Foto" className="object-cover" />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                  {nomeWatch.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Nome</Label>
                  <Input
                    placeholder="Ex: João Silva"
                    {...register(`time.${index}.nome`)}
                    className="bg-black border-zinc-800 focus-visible:ring-yellow-500/50 h-9"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Cargo / Especialidade</Label>
                  <Input
                    placeholder="Ex: Barbeiro Chefe"
                    {...register(`time.${index}.role`)}
                    className="bg-black border-zinc-800 focus-visible:ring-yellow-500/50 h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">URL da Foto (Opcional)</Label>
                  <Input
                    placeholder="https://..."
                    {...register(`time.${index}.foto`)}
                    className="bg-black border-zinc-800 focus-visible:ring-yellow-500/50 h-9"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          );
        })}

        {team.length === 0 && (
          <div className="text-center p-8 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500">Sua equipe está vazia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
