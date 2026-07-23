import { notFound } from "next/navigation";
import { EstabelecimentoBanner } from "@/components/shared/estabelecimento/EstabelecimentoBanner";
import { AddressMapper } from "@/components/shared/estabelecimento/AddressMapper";
import { ServicesAccordion } from "@/components/shared/estabelecimento/ServicesAccordion";
import { TeamGallery } from "@/components/shared/estabelecimento/TeamGallery";
import { ReviewsWall } from "@/components/shared/estabelecimento/ReviewsWall";
import { TenantInfoSection } from "@/components/shared/estabelecimento/TenantInfoSection";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { SECOES_LAYOUT_PADRAO } from "@/lib/mock/temas";
import { mapToEstabelecimento } from "@/lib/mappers/estabelecimento.mapper";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { tenantProfessionalsService } from "@/lib/api/services/tenant-professionals.service";
import { catalogService } from "@/lib/api/services/catalog.service";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { themeService } from "@/lib/api/services/theme.service";
import type {
  PublicProfessional,
  Service,
  Tenant,
  ReviewList,
  TenantThemeData,
} from "@/lib/api/types";
import type {
  SecaoLayout,
  VarianteComponente,
  Estabelecimento,
  BorderRadiusOpcao,
} from "@/types";

interface EstabelecimentoPageProps {
  params: Promise<{ slug: string }>;
}

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
  tenantId,
}: {
  secao: SecaoLayout;
  estabelecimento: Estabelecimento;
  tenantId: string;
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
      return (
        <section>
          <ReviewsWall tenantId={tenantId} />
        </section>
      );
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

async function loadData(slug: string) {
  let tenant: Tenant;
  try {
    tenant = await tenantsService.getBySlug(slug);
  } catch {
    return null;
  }

  const [professionals, services, reviews, themeRes] = await Promise.all([
    tenantProfessionalsService
      .listPublic(tenant.id)
      .catch(() => [] as PublicProfessional[]),
    catalogService.listPublic(tenant.id).catch(() => [] as Service[]),
    reviewsService.listTenant(tenant.id).catch(() => null as ReviewList | null),
    themeService.get(tenant.id).catch(() => null),
  ]);

  const theme: TenantThemeData | null = themeRes?.theme ?? null;

  return { tenant, professionals, services, reviews, theme };
}

export default async function EstabelecimentoPage({
  params,
}: EstabelecimentoPageProps) {
  const { slug } = await params;
  const data = await loadData(slug);

  if (!data) notFound();

  const { tenant, professionals, services, reviews, theme } = data;

  const estabelecimento = mapToEstabelecimento({
    tenant,
    professionals,
    services,
    reviews,
    theme,
  });

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
                  tenantId={tenant.id}
                />
              ))}
            </div>

            <div className="h-fit space-y-8 lg:sticky lg:top-8">
              {secoesSidebar.map((secao) => (
                <RenderizarSecao
                  key={secao.id}
                  secao={secao}
                  estabelecimento={estabelecimento}
                  tenantId={tenant.id}
                />
              ))}

              <div className="hidden md:block">
                <BookingWizard
                  tenantId={tenant.id}
                  professionals={professionals}
                  services={services}
                  tenantPhone={estabelecimento.telefone ?? tenant.telephone}
                  tenantName={estabelecimento.nome ?? tenant.name}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA fixo mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border p-4 backdrop-blur-md md:hidden">
          <BookingWizard
            tenantId={tenant.id}
            professionals={professionals}
            services={services}
            tenantPhone={estabelecimento.telefone ?? tenant.telephone}
            tenantName={estabelecimento.nome ?? tenant.name}
          />
        </div>
      </main>
    </>
  );
}
