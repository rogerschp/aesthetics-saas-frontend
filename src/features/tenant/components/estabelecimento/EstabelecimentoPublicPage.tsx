import type { ReactNode } from "react";
import { EstabelecimentoBanner } from "@/features/tenant/components/estabelecimento/EstabelecimentoBanner";
import { AddressMapper } from "@/features/tenant/components/estabelecimento/AddressMapper";
import { ServicesAccordion } from "@/features/tenant/components/estabelecimento/ServicesAccordion";
import { TeamGallery } from "@/features/tenant/components/estabelecimento/TeamGallery";
import { TenantInfoSection } from "@/features/tenant/components/estabelecimento/TenantInfoSection";
import { SECOES_LAYOUT_PADRAO } from "@/shared/lib/mock/temas";
import { tenantsService } from "@/features/tenant/api/tenants.service";
import { catalogService } from "@/features/tenant/api/catalog.service";
import { themeService } from "@/features/tenant/api/theme.service";
import type { Service } from "@/shared/lib/api/types";
import type { Tenant } from "@/features/tenant/model/tenant.types";
import type { TenantThemeData } from "@/features/tenant/model/theme.types";
import type {
  SecaoLayout,
  VarianteComponente,
  Estabelecimento,
  BorderRadiusOpcao,
} from "@/shared/types";

// GAP documentado: não há endpoint público de horários da loja.
const TIPOS_OMITIDOS = new Set(["horarios"]);

/** Garante seções essenciais mesmo se o tema custom omitir alguma. */
function mergeSecoesLayout(custom?: SecaoLayout[] | null): SecaoLayout[] {
  const base = custom?.length ? [...custom] : [...SECOES_LAYOUT_PADRAO];
  for (const padrao of SECOES_LAYOUT_PADRAO) {
    if (!base.some((s) => s.tipo === padrao.tipo)) {
      base.push({ ...padrao, ordem: base.length });
    }
  }
  return base;
}

function RenderizarSecao({
  secao,
  estabelecimento,
  reviewsSection,
}: {
  secao: SecaoLayout;
  estabelecimento: Estabelecimento;
  reviewsSection: ReactNode;
}) {
  const variante: VarianteComponente = (secao.variante as VarianteComponente) || "padrao";

  switch (secao.tipo) {
    case "sobre":
      return <TenantInfoSection estabelecimento={estabelecimento} />;
    case "profissionais":
      return (
        <section>
          <TeamGallery time={estabelecimento.time} variante={variante} />
        </section>
      );
    case "servicos":
      return (
        <section>
          <ServicesAccordion servicos={estabelecimento.servicos} variante={variante} />
        </section>
      );
    case "avaliacoes":
      return <section>{reviewsSection}</section>;
    case "endereco":
      return (
        <section>
          <AddressMapper
            localizacao={estabelecimento.localizacao}
            latitude={estabelecimento.latitude}
            longitude={estabelecimento.longitude}
          />
        </section>
      );
    default:
      return null;
  }
}

export interface TenantEstabelecimentoBase {
  tenant: Tenant;
  services: Service[];
  theme: TenantThemeData | null;
}

/**
 * Carrega apenas os dados públicos de propriedade da feature `tenant`
 * (tenant, serviços, tema). Profissionais e avaliações são carregados pela
 * página (`app/.../estabelecimento/[slug]/page.tsx`), que compõe o resultado
 * final — ADR-003: feature ↛ feature.
 */
export async function loadTenantEstabelecimentoBase(
  slug: string,
): Promise<TenantEstabelecimentoBase | null> {
  let tenant: Tenant;
  try {
    tenant = await tenantsService.getBySlug(slug);
  } catch {
    return null;
  }

  const [services, themeRes] = await Promise.all([
    catalogService.listPublic(tenant.id).catch(() => [] as Service[]),
    themeService.get(tenant.id).catch(() => null),
  ]);

  const theme: TenantThemeData | null = themeRes?.theme ?? null;

  return { tenant, services, theme };
}

export interface EstabelecimentoPublicPageProps {
  estabelecimento: Estabelecimento;
  /** Slot da seção "avaliações" — a página injeta o `ReviewsWall` (feature `reviews`). */
  reviewsSection: ReactNode;
  /** Slot do wizard de agendamento — a página injeta o `BookingWizard` (feature `booking`). */
  bookingWizard: ReactNode;
}

export function EstabelecimentoPublicPage({
  estabelecimento,
  reviewsSection,
  bookingWizard,
}: EstabelecimentoPublicPageProps) {
  const tema = estabelecimento.tema;
  const secoesLayout = mergeSecoesLayout(tema?.secoesLayout);

  const secoesVisiveis = [...secoesLayout]
    .filter((s) => s.visivel && !TIPOS_OMITIDOS.has(String(s.tipo)))
    .sort((a, b) => a.ordem - b.ordem);

  const TIPOS_SIDEBAR = new Set(["endereco"]);
  const secoesMain = secoesVisiveis.filter((s) => !TIPOS_SIDEBAR.has(String(s.tipo)));
  const secoesSidebar = secoesVisiveis.filter((s) =>
    TIPOS_SIDEBAR.has(String(s.tipo)),
  );

  const MAPA_RADIUS: Record<BorderRadiusOpcao, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "16px",
    full: "9999px",
  };

  const estiloTema = tema
    ? ({
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
        "--radius": MAPA_RADIUS[tema.borderRadius as BorderRadiusOpcao] ?? "16px",
        fontFamily: `"${tema.fonte}", sans-serif`,
        color: tema.corTexto,
        backgroundColor: tema.corFundo,
      } as React.CSSProperties)
    : undefined;

  const googleFontUrl =
    tema && tema.fonte !== "Inter"
      ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          tema.fonte,
        )}:wght@300;400;500;600;700&display=swap`
      : null;

  return (
    <>
      {googleFontUrl && <link rel="stylesheet" href={googleFontUrl} />}

      <main className="min-h-screen pb-24 md:pb-0" style={estiloTema}>
        <EstabelecimentoBanner estabelecimento={estabelecimento} />

        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {secoesMain.map((secao) => (
                <RenderizarSecao
                  key={secao.id}
                  secao={secao}
                  estabelecimento={estabelecimento}
                  reviewsSection={reviewsSection}
                />
              ))}
            </div>

            <div className="h-fit space-y-8 lg:sticky lg:top-8">
              {secoesSidebar.map((secao) => (
                <RenderizarSecao
                  key={secao.id}
                  secao={secao}
                  estabelecimento={estabelecimento}
                  reviewsSection={reviewsSection}
                />
              ))}

              <div className="hidden md:block">{bookingWizard}</div>
            </div>
          </div>
        </div>

        {/* CTA fixo mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border p-4 backdrop-blur-md md:hidden">
          {bookingWizard}
        </div>
      </main>
    </>
  );
}
