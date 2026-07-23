"use client";

import { cn } from "@/lib/utils";
import {
  Building2,
  Clock,
  Scissors,
  Users,
  Palette,
  Lock,
} from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Seções disponíveis no painel de edição do estabelecimento.
 * Cada seção mapeia para um conteúdo específico renderizado na área principal.
 */
export type SecaoEdicao =
  | "informacoes"
  | "expediente"
  | "servicos"
  | "equipe"
  | "aparencia";

interface EditarEstabelecimentoSidebarProps {
  secaoAtiva: SecaoEdicao;
  onMudarSecao: (secao: SecaoEdicao) => void;
  /** Free = false. Standard+ libera Aparência. */
  canCustomize?: boolean;
}

/** Definição de um item no menu lateral */
interface ItemMenu {
  id: SecaoEdicao;
  icone: React.ReactNode;
  chaveI18n: string;
  locked?: boolean;
}

const TAMANHO_ICONE = "h-5 w-5";

/**
 * EditarEstabelecimentoSidebar
 *
 * Componente de navegação lateral para a tela de edição do estabelecimento.
 * - Desktop: sidebar vertical fixa à esquerda
 * - Mobile: tabs horizontais scrolláveis no topo
 */
export function EditarEstabelecimentoSidebar({
  secaoAtiva,
  onMudarSecao,
  canCustomize = true,
}: EditarEstabelecimentoSidebarProps) {
  const t = useTranslations("EditarSidebar");

  const itensMenu: ItemMenu[] = [
    {
      id: "informacoes",
      icone: <Building2 className={TAMANHO_ICONE} />,
      chaveI18n: "informacoes",
    },
    {
      id: "expediente",
      icone: <Clock className={TAMANHO_ICONE} />,
      chaveI18n: "expediente",
    },
    {
      id: "servicos",
      icone: <Scissors className={TAMANHO_ICONE} />,
      chaveI18n: "servicos",
    },
    {
      id: "equipe",
      icone: <Users className={TAMANHO_ICONE} />,
      chaveI18n: "equipe",
    },
    {
      id: "aparencia",
      icone: <Palette className={TAMANHO_ICONE} />,
      chaveI18n: "aparencia",
      locked: !canCustomize,
    },
  ];

  return (
    <>
      {/* Desktop: Sidebar vertical */}
      <nav className="hidden lg:flex flex-col gap-1 w-64 shrink-0 sticky top-28 h-fit">
        <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-2xl p-3 shadow-xl backdrop-blur-sm">
          {itensMenu.map((item) => {
            const ativo = secaoAtiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onMudarSecao(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  ativo
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent",
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    ativo ? "text-yellow-500" : "text-zinc-500",
                  )}
                >
                  {item.icone}
                </span>
                <span className="truncate">{t(item.chaveI18n)}</span>
                {item.locked && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />
                    {t("badgePlan")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile: Tabs horizontais scrolláveis */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide border-b border-zinc-800/80 mb-6">
        <div className="flex gap-1 w-max p-1">
          {itensMenu.map((item) => {
            const ativo = secaoAtiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onMudarSecao(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                  ativo
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60",
                )}
              >
                {item.icone}
                <span>{t(item.chaveI18n)}</span>
                {item.locked && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">
                    <Lock className="h-2.5 w-2.5" />
                    {t("badgePlan")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
