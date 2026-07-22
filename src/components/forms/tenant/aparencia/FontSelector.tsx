"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FonteDisponivel } from "@/types";

interface FontSelectorProps {
  fonteAtiva: FonteDisponivel;
  onChange: (fonte: FonteDisponivel) => void;
}

/** Fontes disponíveis com preview e URL do Google Fonts */
const FONTES: { nome: FonteDisponivel; estilo: string; preview: string }[] = [
  { nome: "Inter", estilo: "font-sans", preview: "Moderna e limpa" },
  { nome: "Playfair Display", estilo: "font-serif", preview: "Elegante e clássica" },
  { nome: "Roboto", estilo: "font-sans", preview: "Versátil e neutra" },
  { nome: "Outfit", estilo: "font-sans", preview: "Geométrica e sofisticada" },
  { nome: "Bebas Neue", estilo: "font-sans", preview: "Impactante e bold" },
  { nome: "Montserrat", estilo: "font-sans", preview: "Clean e profissional" },
  { nome: "Poppins", estilo: "font-sans", preview: "Arredondada e amigável" },
];

/**
 * FontSelector
 *
 * Grid visual de fontes para selecionar a tipografia da página pública.
 * Carrega fontes do Google Fonts via link no head dinamicamente.
 */
export function FontSelector({ fonteAtiva, onChange }: FontSelectorProps) {
  const t = useTranslations("Aparencia");

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-300">{t("fonteLabel")}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FONTES.map((fonte) => {
          const selecionada = fonteAtiva === fonte.nome;
          return (
            <button
              key={fonte.nome}
              type="button"
              onClick={() => onChange(fonte.nome)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-yellow-500/30",
                selecionada
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
              )}
            >
              <div className="flex flex-col items-start gap-1">
                <span
                  className="text-lg text-white font-medium"
                  style={{ fontFamily: fonte.nome }}
                >
                  {fonte.nome}
                </span>
                <span className="text-xs text-zinc-500">{fonte.preview}</span>
              </div>
              {selecionada && (
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
