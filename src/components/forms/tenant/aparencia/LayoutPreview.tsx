"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone, Users, Scissors, Clock, Star, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { TenantTema, BorderRadiusOpcao, TipoSecao } from "@/types";

interface LayoutPreviewProps {
  tema: TenantTema;
}

/** Mapeia borderRadius para valor CSS */
const MAPA_RADIUS: Record<BorderRadiusOpcao, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

/** Config de cada seção para o preview */
interface SecaoPreviewConfig {
  rotulo: string;
  icone: React.ReactNode;
  coluna: "main" | "sidebar";
  renderConteudo: (tema: TenantTema, radius: string, variante: string) => React.ReactNode;
}

const ICONE_SIZE = "w-3 h-3";

/** Conteúdo de exemplo para cada seção do preview */
const SECAO_CONFIG: Record<TipoSecao, SecaoPreviewConfig> = {
  sobre: {
    rotulo: "Sobre",
    icone: <Info className={ICONE_SIZE} />,
    coluna: "main",
    renderConteudo: (tema, radius) => (
      <div className="space-y-1.5">
        <div className="h-2 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.6, width: "55%", borderRadius: radius }} />
        <div className="h-1.5 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.15, width: "100%", borderRadius: radius }} />
        <div className="h-1.5 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.12, width: "90%", borderRadius: radius }} />
        <div className="h-1.5 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.1, width: "75%", borderRadius: radius }} />
      </div>
    ),
  },
  profissionais: {
    rotulo: "Profissionais",
    icone: <Users className={ICONE_SIZE} />,
    coluna: "main",
    renderConteudo: (tema, radius, variante) => {
      if (variante === "compacto") {
        return (
          <div className="space-y-1.5">
            {["Roger M.", "Carlos A.", "Julia F."].map((nome) => (
              <div key={nome} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tema.corPrimaria, opacity: 0.4 }} />
                <div className="h-1.5 flex-1 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.2, borderRadius: radius }} />
                <span style={{ color: tema.corTexto, opacity: 0.3, fontSize: "6px" }}>{nome}</span>
              </div>
            ))}
          </div>
        );
      }
      // Padrão e alternativo: cards/avatares
      return (
        <div className={cn("flex gap-2", variante === "alternativo" ? "flex-col" : "flex-row")}>
          {["R", "C", "J"].map((inicial, i) => (
            <div key={i} className={cn(
              "flex items-center gap-1.5 p-1.5",
              variante === "alternativo" ? "flex-row" : "flex-col"
            )} style={{ borderRadius: radius, backgroundColor: `${tema.corSecundaria}80`, border: `1px solid ${tema.corPrimaria}20` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${tema.corPrimaria}30` }}>
                <span style={{ color: tema.corPrimaria, fontSize: "6px", fontWeight: 700 }}>{inicial}</span>
              </div>
              <div className="h-1 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.15, width: variante === "alternativo" ? "40px" : "24px", borderRadius: radius }} />
            </div>
          ))}
        </div>
      );
    },
  },
  servicos: {
    rotulo: "Serviços",
    icone: <Scissors className={ICONE_SIZE} />,
    coluna: "main",
    renderConteudo: (tema, radius, variante) => {
      const servicos = [
        { nome: "Corte Tesoura", preco: "R$ 65" },
        { nome: "Barba Completa", preco: "R$ 45" },
        { nome: "Hidratação", preco: "R$ 80" },
      ];

      if (variante === "alternativo") {
        return (
          <div className="grid grid-cols-2 gap-1.5">
            {servicos.map((s) => (
              <div key={s.nome} className="p-1.5 flex items-center justify-between" style={{ borderRadius: radius, backgroundColor: `${tema.corSecundaria}80`, border: `1px solid ${tema.corPrimaria}20` }}>
                <span style={{ color: tema.corTexto, opacity: 0.4, fontSize: "5px" }}>{s.nome}</span>
                <span style={{ color: tema.corPrimaria, fontSize: "6px", fontWeight: 700 }}>{s.preco}</span>
              </div>
            ))}
          </div>
        );
      }

      if (variante === "compacto") {
        return (
          <div className="space-y-1">
            {servicos.map((s) => (
              <div key={s.nome} className="flex justify-between items-center py-0.5" style={{ borderBottom: `1px solid ${tema.corTexto}10` }}>
                <span style={{ color: tema.corTexto, opacity: 0.3, fontSize: "5px" }}>{s.nome}</span>
                <span style={{ color: tema.corTexto, opacity: 0.5, fontSize: "5px" }}>{s.preco}</span>
              </div>
            ))}
          </div>
        );
      }

      // Padrão: accordion style
      return (
        <div className="space-y-1">
          {servicos.map((s) => (
            <div key={s.nome} className="flex justify-between items-center p-1.5" style={{ borderRadius: radius, backgroundColor: `${tema.corSecundaria}50`, border: `1px solid ${tema.corPrimaria}15` }}>
              <span style={{ color: tema.corTexto, opacity: 0.3, fontSize: "5px" }}>{s.nome}</span>
              <span style={{ color: tema.corTexto, opacity: 0.5, fontSize: "6px", fontWeight: 600 }}>{s.preco}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  avaliacoes: {
    rotulo: "Avaliações",
    icone: <Star className={ICONE_SIZE} />,
    coluna: "main",
    renderConteudo: (tema, radius) => (
      <div className="flex gap-1.5">
        {[5, 4, 5].map((nota, i) => (
          <div key={i} className="p-1.5 flex-1" style={{ borderRadius: radius, backgroundColor: `${tema.corSecundaria}60`, border: `1px solid ${tema.corPrimaria}15` }}>
            <div className="flex gap-0.5 mb-1">
              {Array.from({ length: nota }).map((_, j) => (
                <div key={j} className="w-1.5 h-1.5" style={{ color: tema.corPrimaria, fontSize: "5px" }}>★</div>
              ))}
            </div>
            <div className="h-1 rounded-sm" style={{ backgroundColor: tema.corTexto, opacity: 0.1, width: "80%", borderRadius: radius }} />
          </div>
        ))}
      </div>
    ),
  },
  horarios: {
    rotulo: "Horários",
    icone: <Clock className={ICONE_SIZE} />,
    coluna: "sidebar",
    renderConteudo: (tema, radius, variante) => {
      const dias = [
        { dia: "Seg", h: "10-19h" },
        { dia: "Ter", h: "09-20h" },
        { dia: "Qua", h: "09-20h" },
        { dia: "Qui", h: "09-20h" },
        { dia: "Sex", h: "09-21h" },
        { dia: "Sáb", h: "08-19h" },
      ];

      if (variante === "compacto") {
        return (
          <div className="grid grid-cols-3 gap-1">
            {dias.map((d) => (
              <div key={d.dia} className="text-center p-1" style={{ borderRadius: radius, backgroundColor: `${tema.corSecundaria}60`, border: `1px solid ${tema.corPrimaria}15` }}>
                <span style={{ color: tema.corPrimaria, fontSize: "5px", fontWeight: 700 }} className="block">{d.dia}</span>
                <span style={{ color: tema.corTexto, opacity: 0.4, fontSize: "4px" }} className="block">{d.h}</span>
              </div>
            ))}
          </div>
        );
      }

      if (variante === "alternativo") {
        return (
          <div className="space-y-1">
            {dias.map((d) => (
              <div key={d.dia} className="flex items-center gap-1.5">
                <span style={{ color: tema.corTexto, opacity: 0.4, fontSize: "5px" }} className="w-5 text-right">{d.dia}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${tema.corSecundaria}60` }}>
                  <div className="h-full rounded-full" style={{ backgroundColor: `${tema.corPrimaria}40`, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        );
      }

      // Padrão: lista de dias
      return (
        <div className="space-y-1">
          {dias.map((d) => (
            <div key={d.dia} className="flex justify-between py-0.5" style={{ borderBottom: `1px solid ${tema.corTexto}08` }}>
              <span style={{ color: tema.corTexto, opacity: 0.4, fontSize: "5px" }}>{d.dia}</span>
              <span style={{ color: tema.corTexto, opacity: 0.3, fontSize: "5px" }}>{d.h}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  endereco: {
    rotulo: "Endereço",
    icone: <MapPin className={ICONE_SIZE} />,
    coluna: "sidebar",
    renderConteudo: (tema, radius) => (
      <div className="space-y-1.5">
        <div className="h-12 rounded-md overflow-hidden relative" style={{ backgroundColor: `${tema.corSecundaria}60`, borderRadius: radius }}>
          {/* Simulação de mapa com pino */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tema.corPrimaria }} />
          </div>
          <div className="absolute bottom-1 left-1.5">
            <span style={{ color: tema.corTexto, opacity: 0.3, fontSize: "4px" }}>Av. Paulista, 1000</span>
          </div>
        </div>
      </div>
    ),
  },
};

/**
 * LayoutPreview
 *
 * Preview miniatura da página pública com layout 2 colunas fiel ao real:
 * - Coluna esquerda (2/3): Sobre, Profissionais, Serviços, Avaliações
 * - Coluna direita (1/3): Horários, Endereço, CTA
 * 
 * Cada seção renderiza conteúdo de exemplo que reflete a variante
 * selecionada, com textos e dados fictícios para que o usuário
 * visualize o resultado das suas configurações.
 */
export function LayoutPreview({ tema }: LayoutPreviewProps) {
  const t = useTranslations("Aparencia");
  const [modo, setModo] = useState<"desktop" | "mobile">("desktop");

  const secoesVisiveis = useMemo(
    () =>
      [...tema.secoesLayout]
        .filter((s) => s.visivel)
        .sort((a, b) => a.ordem - b.ordem),
    [tema.secoesLayout]
  );

  // Separar em coluna principal e sidebar (igual à página real)
  const secoesMain = useMemo(
    () => secoesVisiveis.filter((s) => SECAO_CONFIG[s.tipo].coluna === "main"),
    [secoesVisiveis]
  );

  const secoesSidebar = useMemo(
    () => secoesVisiveis.filter((s) => SECAO_CONFIG[s.tipo].coluna === "sidebar"),
    [secoesVisiveis]
  );

  const estiloBase = useMemo(
    () => ({
      backgroundColor: tema.corFundo,
      color: tema.corTexto,
      fontFamily: `"${tema.fonte}", sans-serif`,
    }),
    [tema]
  );

  const radius = MAPA_RADIUS[tema.borderRadius];

  /** Renderiza um card de seção com ícone, label, variante e conteúdo de exemplo */
  const renderSecaoCard = (secao: typeof secoesVisiveis[0]) => {
    const config = SECAO_CONFIG[secao.tipo];
    return (
      <div
        key={secao.id}
        className="p-2.5 transition-colors duration-200"
        style={{
          borderRadius: radius,
          backgroundColor: `${tema.corSecundaria}50`,
          border: `1px solid ${tema.corPrimaria}20`,
        }}
      >
        {/* Header da seção */}
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ color: tema.corPrimaria }}>{config.icone}</span>
          <span
            className="font-semibold uppercase tracking-wider"
            style={{ color: tema.corPrimaria, fontSize: "7px" }}
          >
            {config.rotulo}
          </span>
          <span
            className="ml-auto px-1 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${tema.corPrimaria}15`,
              color: tema.corPrimaria,
              fontSize: "5px",
            }}
          >
            {secao.variante}
          </span>
        </div>

        {/* Conteúdo de exemplo */}
        {config.renderConteudo(tema, radius, secao.variante)}
      </div>
    );
  };

  return (
    <div className="space-y-4 mt-8">
      {/* Header com toggle desktop/mobile */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-300">
          {t("preview")}
        </h4>
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => setModo("desktop")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              modo === "desktop"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
            title={t("previewDesktop")}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setModo("mobile")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              modo === "mobile"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
            title={t("previewMobile")}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Container do preview */}
      <div
        className={cn(
          "border border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 mx-auto",
          modo === "desktop" ? "w-full" : "w-[320px]"
        )}
      >
        <div
          style={estiloBase}
          className="min-h-[420px] p-3 transition-colors duration-300"
        >
          {/* Banner simulado */}
          <div
            className="w-full h-16 mb-3 relative overflow-hidden"
            style={{
              borderRadius: radius,
              background: `linear-gradient(135deg, ${tema.corPrimaria}40, ${tema.corSecundaria})`,
            }}
          >
            <div className="absolute bottom-2 left-3">
              <div
                className="h-2.5 w-28 rounded-sm mb-0.5"
                style={{ backgroundColor: tema.corTexto, opacity: 0.9, borderRadius: radius }}
              />
              <div
                className="h-1.5 w-40 rounded-sm"
                style={{ backgroundColor: tema.corTexto, opacity: 0.3, borderRadius: radius }}
              />
            </div>
          </div>

          {/* Layout 2 colunas fiel à página real */}
          {modo === "desktop" ? (
            <div className="flex gap-3">
              {/* Coluna principal (2/3) — Sobre, Profissionais, Serviços, Avaliações */}
              <div className="flex-[2] space-y-2.5 min-w-0">
                {secoesMain.map(renderSecaoCard)}
              </div>

              {/* Sidebar (1/3) — Horários, Endereço, CTA */}
              <div className="flex-1 space-y-2.5 min-w-0">
                {secoesSidebar.map(renderSecaoCard)}

                {/* CTA de agendar */}
                <div
                  className="p-2 text-center"
                  style={{
                    borderRadius: radius,
                    backgroundColor: tema.corPrimaria,
                  }}
                >
                  <span style={{ color: tema.corFundo, fontSize: "7px", fontWeight: 700 }}>
                    Agendar Horário
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile: coluna única */
            <div className="space-y-2.5">
              {secoesVisiveis.map(renderSecaoCard)}
              <div
                className="p-2 text-center"
                style={{
                  borderRadius: radius,
                  backgroundColor: tema.corPrimaria,
                }}
              >
                <span style={{ color: tema.corFundo, fontSize: "7px", fontWeight: 700 }}>
                  Agendar Horário
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
