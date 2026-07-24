"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { CopyPlus, Plus, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ServiceHierarchyBuilder() {
  const { control, register } = useFormContext();
  
  const { fields: topics, append: appendTopic, remove: removeTopic } = useFieldArray({
    control,
    name: "servicos",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Scissors className="h-5 w-5 text-yellow-500" />
            Catálogo de Serviços
          </h3>
          <p className="text-sm text-zinc-400">
            Organize seus serviços por categorias (Ex: Corte, Barba) e adicione as variações com seus preços.
          </p>
        </div>
        <Button 
          type="button" 
          onClick={() => appendTopic({ titulo: "", itens: [{ descricao: "", preco: 0 }] })}
          className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="space-y-6 pt-4">
        {topics.map((topic, topicIndex) => (
          <div key={topic.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTopic(topicIndex)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
              title="Remover Categoria"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2 max-w-sm mb-6">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Nome da Categoria</Label>
              <Input
                placeholder="Ex: Terapia Capilar"
                {...register(`servicos.${topicIndex}.titulo`)}
                className="bg-black border-zinc-800 text-lg font-bold focus-visible:ring-yellow-500/50"
              />
            </div>

            <SubtopicList topicIndex={topicIndex} />
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center p-10 border border-dashed border-zinc-800 rounded-2xl">
            <CopyPlus className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">Nenhum serviço cadastrado.</p>
            <p className="text-sm text-zinc-600 mb-4">Comece adicionando a primeira categoria.</p>
            <Button 
              type="button" 
              onClick={() => appendTopic({ titulo: "Cabelo", itens: [{ descricao: "Corte Simples", preco: 50 }] })}
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Adicionar Exemplo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubtopicList({ topicIndex }: { topicIndex: number }) {
  const { control, register } = useFormContext();
  const { fields: subtopics, append: appendSubtopic, remove: removeSubtopic } = useFieldArray({
    control,
    name: `servicos.${topicIndex}.itens`,
  });

  return (
    <div className="space-y-3">
      {subtopics.map((subtopic, subIndex) => (
        <div key={subtopic.id} className="flex gap-3 items-start">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Descrição do serviço (ex: Corte na Tesoura)"
              {...register(`servicos.${topicIndex}.itens.${subIndex}.descricao`)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-500/50"
            />
          </div>
          <div className="w-32 relative space-y-1">
            <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">R$</span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register(`servicos.${topicIndex}.itens.${subIndex}.preco`, { valueAsNumber: true })}
              className="bg-zinc-900 border-zinc-800 pl-8 pr-3 focus-visible:ring-yellow-500/50 text-right font-medium"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSubtopic(subIndex)}
            className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="ghost"
        onClick={() => appendSubtopic({ descricao: "", preco: 0 })}
        className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 w-fit h-auto py-2 px-3 text-sm"
      >
        <Plus className="h-3 w-3 mr-2" />
        Adicionar item à categoria
      </Button>
    </div>
  );
}
