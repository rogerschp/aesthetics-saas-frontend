"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ColorPickerProps {
  label: string;
  valor: string;
  onChange: (cor: string) => void;
}

/**
 * ColorPicker
 *
 * Input de cor customizado com preview visual e label.
 * Usa input nativo type="color" com overlay estilizado.
 */
export function ColorPicker({ label, valor, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-10 h-10 rounded-xl border-2 border-zinc-700 shadow-inner cursor-pointer transition-transform hover:scale-110"
            style={{ backgroundColor: valor }}
          />
        </div>
        <input
          type="text"
          value={valor}
          onChange={(e) => {
            const hex = e.target.value;
            // Validação básica de formato hex
            if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
              onChange(hex);
            }
          }}
          maxLength={7}
          className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

interface PaletaSeletorProps {
  paletas: {
    id: string;
    nome: string;
    cores: { primaria: string; secundaria: string; fundo: string; texto: string };
  }[];
  onSelecionar: (paleta: {
    primaria: string;
    secundaria: string;
    fundo: string;
    texto: string;
  }) => void;
}

/**
 * PaletaSeletor
 *
 * Grid de paletas pré-definidas para seleção rápida de cores.
 * Cada paleta mostra 4 cores em miniatura.
 */
export function PaletaSeletor({ paletas, onSelecionar }: PaletaSeletorProps) {
  const t = useTranslations("Aparencia");

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-300">{t("paletas")}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {paletas.map((paleta) => (
          <button
            key={paleta.id}
            type="button"
            onClick={() => onSelecionar(paleta.cores)}
            className={cn(
              "flex flex-col gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50",
              "hover:border-yellow-500/50 hover:bg-zinc-800/50 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
            )}
          >
            <div className="flex gap-1">
              {[paleta.cores.primaria, paleta.cores.secundaria, paleta.cores.fundo, paleta.cores.texto].map(
                (cor, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-md border border-zinc-600"
                    style={{ backgroundColor: cor }}
                  />
                )
              )}
            </div>
            <span className="text-xs text-zinc-400 font-medium truncate">
              {paleta.nome}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
