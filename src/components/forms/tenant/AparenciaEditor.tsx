"use client";

import { useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Palette, Type, RectangleHorizontal, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

import { ColorPicker, PaletaSeletor } from "./aparencia/ColorPicker";
import { FontSelector } from "./aparencia/FontSelector";
import { SecaoOrdenavel } from "./aparencia/SecaoOrdenavel";
import { LayoutPreview } from "./aparencia/LayoutPreview";
import { PALETAS_PRE_DEFINIDAS } from "@/lib/mock/temas";
import type {
  TenantTema,
  FonteDisponivel,
  BorderRadiusOpcao,
  VarianteComponente,
} from "@/types";

interface AparenciaEditorProps {
  tema: TenantTema;
  onTemaChange: (tema: TenantTema) => void;
}

/** Opções de border-radius com preview visual */
const OPCOES_BORDA: { valor: BorderRadiusOpcao; label: string; radius: string }[] = [
  { valor: "none", label: "Nenhum", radius: "0px" },
  { valor: "sm", label: "Sutil", radius: "4px" },
  { valor: "md", label: "Médio", radius: "8px" },
  { valor: "lg", label: "Grande", radius: "16px" },
  { valor: "full", label: "Pílula", radius: "9999px" },
];

/**
 * AparenciaEditor
 *
 * Componente principal da seção "Aparência" no painel de edição.
 * Permite customizar:
 * - Cores (primária, secundária, fundo, texto) + paletas rápidas
 * - Tipografia (seleção de Google Font)
 * - Arredondamento de bordas
 * - Organização das seções via drag and drop
 */
export function AparenciaEditor({ tema, onTemaChange }: AparenciaEditorProps) {
  const t = useTranslations("Aparencia");

  // Sensores do drag and drop com ativação por distância mínima
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Modifiers para restringir eixo e limitar ao container pai
  const modifiers = useMemo(() => [restrictToVerticalAxis, restrictToParentElement], []);

  /** Atualiza uma propriedade simples do tema */
  const atualizarTema = useCallback(
    <K extends keyof TenantTema>(chave: K, valor: TenantTema[K]) => {
      onTemaChange({ ...tema, [chave]: valor });
    },
    [tema, onTemaChange]
  );

  /** Aplica uma paleta pré-definida ao tema */
  const aplicarPaleta = useCallback(
    (cores: { primaria: string; secundaria: string; fundo: string; texto: string }) => {
      onTemaChange({
        ...tema,
        corPrimaria: cores.primaria,
        corSecundaria: cores.secundaria,
        corFundo: cores.fundo,
        corTexto: cores.texto,
      });
    },
    [tema, onTemaChange]
  );

  /** Toggle de visibilidade de uma seção */
  const toggleVisibilidade = useCallback(
    (id: string) => {
      const secoesAtualizadas = tema.secoesLayout.map((s) =>
        s.id === id ? { ...s, visivel: !s.visivel } : s
      );
      atualizarTema("secoesLayout", secoesAtualizadas);
    },
    [tema.secoesLayout, atualizarTema]
  );

  /** Muda a variante visual de uma seção */
  const mudarVariante = useCallback(
    (id: string, variante: VarianteComponente) => {
      const secoesAtualizadas = tema.secoesLayout.map((s) =>
        s.id === id ? { ...s, variante } : s
      );
      atualizarTema("secoesLayout", secoesAtualizadas);
    },
    [tema.secoesLayout, atualizarTema]
  );

  /** Handler do drag and drop para reordenar seções */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tema.secoesLayout.findIndex((s) => s.id === active.id);
      const newIndex = tema.secoesLayout.findIndex((s) => s.id === over.id);

      const secoesReordenadas = arrayMove(
        tema.secoesLayout,
        oldIndex,
        newIndex
      ).map((s, i) => ({ ...s, ordem: i }));

      atualizarTema("secoesLayout", secoesReordenadas);
    },
    [tema.secoesLayout, atualizarTema]
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Palette className="h-5 w-5 text-yellow-500" />
          {t("titulo")}
        </h3>
        <p className="text-sm text-zinc-400">{t("subtitulo")}</p>
      </div>

      {/* === SEÇÃO: Cores === */}
      <section className="space-y-6">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          {t("cores")}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ColorPicker
            label={t("corPrimaria")}
            valor={tema.corPrimaria}
            onChange={(c) => atualizarTema("corPrimaria", c)}
          />
          <ColorPicker
            label={t("corSecundaria")}
            valor={tema.corSecundaria}
            onChange={(c) => atualizarTema("corSecundaria", c)}
          />
          <ColorPicker
            label={t("corFundo")}
            valor={tema.corFundo}
            onChange={(c) => atualizarTema("corFundo", c)}
          />
          <ColorPicker
            label={t("corTexto")}
            valor={tema.corTexto}
            onChange={(c) => atualizarTema("corTexto", c)}
          />
        </div>

        <PaletaSeletor paletas={PALETAS_PRE_DEFINIDAS} onSelecionar={aplicarPaleta} />
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/50" />

      {/* === SEÇÃO: Tipografia === */}
      <section className="space-y-6">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <Type className="h-4 w-4 text-yellow-500" />
          {t("tipografia")}
        </h4>

        <FontSelector
          fonteAtiva={tema.fonte}
          onChange={(f: FonteDisponivel) => atualizarTema("fonte", f)}
        />
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/50" />

      {/* === SEÇÃO: Border Radius === */}
      <section className="space-y-6">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <RectangleHorizontal className="h-4 w-4 text-yellow-500" />
          {t("bordas")}
        </h4>

        <div className="flex flex-wrap gap-3">
          {OPCOES_BORDA.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => atualizarTema("borderRadius", opcao.valor)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 min-w-[80px]",
                "focus:outline-none focus:ring-2 focus:ring-yellow-500/30",
                tema.borderRadius === opcao.valor
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
              )}
            >
              <div
                className="w-10 h-7 border-2 border-zinc-400"
                style={{ borderRadius: opcao.radius }}
              />
              <span className="text-[11px] text-zinc-400 font-medium">
                {opcao.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/50" />

      {/* === SEÇÃO: Organização das Seções === */}
      <section className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-white flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-yellow-500" />
            {t("secoes")}
          </h4>
          <p className="text-sm text-zinc-500 mt-1">{t("secoesDesc")}</p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={modifiers}
        >
          <SortableContext
            items={tema.secoesLayout.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tema.secoesLayout.map((secao) => (
                <SecaoOrdenavel
                  key={secao.id}
                  secao={secao}
                  onToggleVisibilidade={toggleVisibilidade}
                  onMudarVariante={mudarVariante}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/50" />

      {/* === SEÇÃO: Preview ao Vivo === */}
      <LayoutPreview tema={tema} />
    </div>
  );
}
