import { getEstabelecimentos } from "@/lib/mock/estabelecimentos";
import { notFound } from "next/navigation";
import { EstabelecimentoBanner } from "@/components/shared/estabelecimento/EstabelecimentoBanner";
import { AddressMapper } from "@/components/shared/estabelecimento/AddressMapper";
import { ServicesAccordion } from "@/components/shared/estabelecimento/ServicesAccordion";
import { TeamGallery } from "@/components/shared/estabelecimento/TeamGallery";
import { WeekTimetable } from "@/components/shared/estabelecimento/WeekTimetable";
import { ReviewsWall } from "@/components/shared/estabelecimento/ReviewsWall";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SECOES_LAYOUT_PADRAO } from "@/lib/mock/temas";
import type { SecaoLayout, VarianteComponente, Estabelecimento, BorderRadiusOpcao } from "@/types";

interface EstabelecimentoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Renderiza uma seção da página pública baseada na configuração do tema.
 * Respeita o tipo da seção e a variante selecionada pelo dono.
 */
function RenderizarSecao({
  secao,
  estabelecimento,
  t,
}: {
  secao: SecaoLayout;
  estabelecimento: Estabelecimento;
  t: (key: string) => string;
}) {
  const variante: VarianteComponente = secao.variante || "padrao";

  switch (secao.tipo) {
    case "sobre":
      return (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {t("about")}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg lg:max-w-3xl">
            {estabelecimento.descricao}
          </p>
        </section>
      );

    case "profissionais":
      return (
        <section>
          <TeamGallery time={estabelecimento.time} variante={variante} />
        </section>
      );

    case "servicos":
      return (
        <section>
          <ServicesAccordion
            servicos={estabelecimento.servicos}
            variante={variante}
          />
        </section>
      );

    case "horarios":
      return (
        <section>
          <WeekTimetable
            horarios={estabelecimento.horarios}
            variante={variante}
          />
        </section>
      );

    case "avaliacoes":
      return (
        <section>
          <ReviewsWall avaliacoes={estabelecimento.avaliacoes} />
        </section>
      );

    case "endereco":
      return (
        <section>
          <AddressMapper localizacao={estabelecimento.localizacao} />
        </section>
      );

    default:
      return null;
  }
}

export default async function EstabelecimentoPage({
  params,
}: EstabelecimentoPageProps) {
  // Awaiting the Promise since Next 15+ mandates route segment parts be promises
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const estabelecimentos = await getEstabelecimentos();
  const estabelecimento = estabelecimentos.find((e) => e.slug === slug);

  if (!estabelecimento) {
    notFound();
  }

  const t = await getTranslations("Estabelecimento");

  // Usa o layout customizado do tema ou o layout padrão
  const secoesLayout = estabelecimento.tema?.secoesLayout ?? SECOES_LAYOUT_PADRAO;
  const tema = estabelecimento.tema;

  // Filtra seções visíveis e ordena pela posição definida
  const secoesVisiveis = [...secoesLayout]
    .filter((s) => s.visivel)
    .sort((a, b) => a.ordem - b.ordem);

  // Separa seções para coluna principal e sidebar
  const TIPOS_SIDEBAR = new Set(["endereco", "horarios"]);
  const secoesMain = secoesVisiveis.filter((s) => !TIPOS_SIDEBAR.has(s.tipo));
  const secoesSidebar = secoesVisiveis.filter((s) => TIPOS_SIDEBAR.has(s.tipo));

  // Mapa de border-radius para valor CSS
  const MAPA_RADIUS: Record<BorderRadiusOpcao, string> = {
    none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px",
  };

  /**
   * Sobrescreve as variáveis CSS do design system (shadcn/Tailwind).
   * Isso propaga as cores do tema para TODOS os componentes filhos que usam
   * classes como text-primary, bg-card, text-foreground, bg-background, etc.
   */
  const estiloTema = tema ? {
    // Variáveis do design system — cores em HEX que substituem oklch
    "--primary": tema.corPrimaria,
    "--primary-foreground": tema.corFundo,
    "--background": tema.corFundo,
    "--foreground": tema.corTexto,
    "--card": tema.corSecundaria,
    "--card-foreground": tema.corTexto,
    "--popover": tema.corSecundaria,
    "--popover-foreground": tema.corTexto,
    "--secondary": tema.corSecundaria,
    "--secondary-foreground": tema.corTexto,
    "--muted": `${tema.corSecundaria}`,
    "--muted-foreground": `${tema.corTexto}99`,
    "--accent": tema.corSecundaria,
    "--accent-foreground": tema.corPrimaria,
    "--border": `${tema.corTexto}18`,
    "--input": `${tema.corTexto}18`,
    "--ring": tema.corPrimaria,
    "--radius": MAPA_RADIUS[tema.borderRadius],
    // Propriedades diretas para font-family e fallback
    fontFamily: `"${tema.fonte}", sans-serif`,
    color: tema.corTexto,
    backgroundColor: tema.corFundo,
  } as React.CSSProperties : undefined;

  // URL do Google Fonts para carregamento dinâmico
  const googleFontUrl = tema && tema.fonte !== "Inter"
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(tema.fonte)}:wght@300;400;500;600;700&display=swap`
    : null;

  return (
    <>
      {/* Carrega Google Font customizada se necessário */}
      {googleFontUrl && (
        <link rel="stylesheet" href={googleFontUrl} />
      )}

      <main className="min-h-screen pb-24 md:pb-0" style={estiloTema}>
        <EstabelecimentoBanner estabelecimento={estabelecimento} />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Space - Left Side */}
            <div className="lg:col-span-2 space-y-10">
              {secoesMain.map((secao) => (
                <RenderizarSecao
                  key={secao.id}
                  secao={secao}
                  estabelecimento={estabelecimento}
                  t={t}
                />
              ))}
            </div>

            {/* Sidebar / Sticky Options - Right Side */}
            <div className="space-y-8 lg:sticky lg:top-8 h-fit">
              {secoesSidebar.map((secao) => (
                <RenderizarSecao
                  key={secao.id}
                  secao={secao}
                  estabelecimento={estabelecimento}
                  t={t}
                />
              ))}

              {/* Desktop CTA */}
              <div className="hidden md:block">
                <Button
                  size="lg"
                  className="w-full font-semibold px-4 py-6 shadow-xl group"
                  style={tema ? {
                    backgroundColor: tema.corPrimaria,
                    color: tema.corFundo,
                    borderRadius: MAPA_RADIUS[tema.borderRadius],
                  } : undefined}
                >
                  <Calendar className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  <span className="text-base">{t("schedule")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md border-t border-border z-50 animate-in slide-in-from-bottom-full duration-500"
          style={tema ? { backgroundColor: `${tema.corFundo}E6` } : undefined}
        >
          <Button
            size="lg"
            className="w-full font-semibold"
            style={tema ? {
              backgroundColor: tema.corPrimaria,
              color: tema.corFundo,
              borderRadius: MAPA_RADIUS[tema.borderRadius],
            } : undefined}
          >
            <Calendar className="w-5 h-5 mr-2" />
            {t("schedule")}
          </Button>
        </div>
      </main>
    </>
  );
}
