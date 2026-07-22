"use client";

import { memo, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { SecaoLayout, VarianteComponente, TipoSecao } from "@/types";

interface SecaoOrderavelProps {
  secao: SecaoLayout;
  onToggleVisibilidade: (id: string) => void;
  onMudarVariante: (id: string, variante: VarianteComponente) => void;
}

/** Mapeia o tipo de seção para a chave de i18n */
const MAPA_TIPO_I18N: Record<TipoSecao, string> = {
  profissionais: "secaoProfissionais",
  horarios: "secaoHorarios",
  servicos: "secaoServicos",
  avaliacoes: "secaoAvaliacoes",
  sobre: "secaoSobre",
  endereco: "secaoEndereco",
};

/** Opções de variantes (constante fora do componente para evitar re-criação) */
const VARIANTES: { valor: VarianteComponente; chave: string }[] = [
  { valor: "padrao", chave: "variantePadrao" },
  { valor: "alternativo", chave: "varianteAlternativo" },
  { valor: "compacto", chave: "varianteCompacto" },
];

/**
 * SecaoOrdenavel
 *
 * Item arrastável que representa uma seção da página pública.
 * Permite reordenar via drag and drop, toglar visibilidade e
 * selecionar variante visual (padrão, alternativo, compacto).
 *
 * Memo evita re-render de itens não afetados durante o drag.
 */
export const SecaoOrdenavel = memo(function SecaoOrdenavel({
  secao,
  onToggleVisibilidade,
  onMudarVariante,
}: SecaoOrderavelProps) {
  const t = useTranslations("Aparencia");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: secao.id });

  const style = {
    // Usar translate3d para GPU acceleration
    transform: CSS.Translate.toString(transform),
    transition,
    willChange: isDragging ? "transform" : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleToggle = useCallback(() => {
    onToggleVisibilidade(secao.id);
  }, [secao.id, onToggleVisibilidade]);

  const handleVariante = useCallback(
    (variante: VarianteComponente) => {
      onMudarVariante(secao.id, variante);
    },
    [secao.id, onMudarVariante]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border",
        isDragging
          ? "border-yellow-500/50 bg-yellow-500/5 shadow-lg shadow-yellow-500/10"
          : "border-zinc-800 bg-zinc-900/50",
        !secao.visivel && "opacity-50"
      )}
    >
      {/* Handle de arraste */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 shrink-0 self-start sm:self-center touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Info da seção */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white block truncate">
          {t(MAPA_TIPO_I18N[secao.tipo])}
        </span>

        {/* Seletor de variante */}
        <div className="flex gap-1.5 mt-2">
          {VARIANTES.map((v) => (
            <button
              key={v.valor}
              type="button"
              onClick={() => handleVariante(v.valor)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-lg",
                secao.variante === v.valor
                  ? "bg-yellow-500/15 text-yellow-500 border border-yellow-500/30"
                  : "bg-zinc-800/50 text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-800"
              )}
            >
              {t(v.chave)}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle visibilidade */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "p-2 rounded-lg shrink-0 self-start sm:self-center",
          secao.visivel
            ? "text-emerald-400 hover:bg-emerald-500/10"
            : "text-zinc-500 hover:bg-zinc-800"
        )}
        title={secao.visivel ? "Ocultar seção" : "Mostrar seção"}
      >
        {secao.visivel ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </div>
  );
});
