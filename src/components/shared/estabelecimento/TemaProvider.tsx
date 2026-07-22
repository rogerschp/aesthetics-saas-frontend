"use client";

import { createContext, useContext, useMemo } from "react";
import type { TenantTema, BorderRadiusOpcao } from "@/types";
import { TEMA_PADRAO } from "@/lib/mock/temas";

interface TemaContextType {
  tema: TenantTema;
}

const TemaContext = createContext<TemaContextType>({ tema: TEMA_PADRAO });

/** Hook para acessar o tema do estabelecimento no escopo renderizado */
export function useTema() {
  return useContext(TemaContext);
}

/** Mapeia os valores de borderRadius para valores CSS reais */
const MAPA_BORDER_RADIUS: Record<BorderRadiusOpcao, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

/**
 * Gera a URL do Google Fonts para carregar a fonte dinamicamente.
 * Retorna null para "Inter" pois já é a fonte padrão do sistema.
 */
function getGoogleFontUrl(fonte: string): string | null {
  if (fonte === "Inter") return null; // Já carregada pelo sistema
  const nomeSanitizado = encodeURIComponent(fonte);
  return `https://fonts.googleapis.com/css2?family=${nomeSanitizado}:wght@300;400;500;600;700&display=swap`;
}

interface TemaProviderProps {
  tema: TenantTema;
  children: React.ReactNode;
}

/**
 * TemaProvider
 *
 * Context Provider que injeta CSS custom properties no DOM para aplicar
 * o tema visual customizado do estabelecimento. Funciona:
 *
 * 1. Define CSS variables (--tema-*) no wrapper div
 * 2. Carrega a Google Font selecionada via <link> dinâmico
 * 3. Aplica font-family e cores via inline style
 *
 * Uso: Envolver o conteúdo da página pública do estabelecimento
 * quando este possui tema customizado (tema?.corPrimaria, etc).
 */
export function TemaProvider({ tema, children }: TemaProviderProps) {
  const fontUrl = useMemo(() => getGoogleFontUrl(tema.fonte), [tema.fonte]);

  const estiloCustom = useMemo(
    () => ({
      "--tema-primaria": tema.corPrimaria,
      "--tema-secundaria": tema.corSecundaria,
      "--tema-fundo": tema.corFundo,
      "--tema-texto": tema.corTexto,
      "--tema-radius": MAPA_BORDER_RADIUS[tema.borderRadius],
      fontFamily: `"${tema.fonte}", sans-serif`,
      color: tema.corTexto,
      backgroundColor: tema.corFundo,
    }),
    [tema]
  );

  return (
    <TemaContext.Provider value={{ tema }}>
      {/* Carrega Google Font dinamicamente se necessário */}
      {fontUrl && (
        <link rel="stylesheet" href={fontUrl} />
      )}

      <div
        style={estiloCustom as React.CSSProperties}
        className="min-h-screen"
      >
        {children}
      </div>
    </TemaContext.Provider>
  );
}
