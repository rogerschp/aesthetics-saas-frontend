import { formatAddressLine } from "@/lib/utils";
import {
  PublicProfessional,
  ProfessionalType,
  ReviewList,
  Service,
  Tenant,
  TenantSegment,
  TenantThemeData,
} from "@/lib/api/types";
import type {
  Avaliacao,
  CategoriaEstabelecimento,
  Estabelecimento,
  Membro,
  ServicoTopico,
  TenantTema,
} from "@/types";

const SEGMENT_TO_CATEGORIA: Record<TenantSegment, CategoriaEstabelecimento> = {
  [TenantSegment.BARBERSHOP]: "barbearia",
  [TenantSegment.TATTOO_STUDIO]: "tatuagem",
  [TenantSegment.HAIR_SALON]: "salao",
  [TenantSegment.BEAUTY_SALON]: "salao",
  [TenantSegment.NAIL_STUDIO]: "salao",
  [TenantSegment.OTHER]: "salao",
};

const PROFESSIONAL_TYPE_LABEL: Record<ProfessionalType, string> = {
  [ProfessionalType.BARBER]: "Barbeiro",
  [ProfessionalType.TATTOO_ARTIST]: "Tatuador(a)",
  [ProfessionalType.HAIRDRESSER]: "Cabeleireiro(a)",
  [ProfessionalType.MANICURE]: "Manicure",
  [ProfessionalType.ESTHETICIAN]: "Esteticista",
  [ProfessionalType.LASH_DESIGNER]: "Lash Designer",
  [ProfessionalType.EYEBROW_DESIGNER]: "Designer de Sobrancelhas",
};

function mapProfessionals(professionals: PublicProfessional[]): Membro[] {
  return professionals.map((p) => ({
    id: p.id,
    userId: p.userId,
    nome: p.displayName,
    foto: p.avatarUrl || undefined,
    role: PROFESSIONAL_TYPE_LABEL[p.professionalType] ?? "Profissional",
  }));
}

/**
 * A API entrega serviços "flat" (sem categoria). Agrupamos em uma única
 * categoria para manter o componente de vitrine existente.
 */
function mapServices(services: Service[]): ServicoTopico[] {
  const ativos = services.filter((s) => s.isActive);
  if (ativos.length === 0) return [];
  return [
    {
      id: "servicos",
      titulo: "Serviços",
      itens: ativos.map((s) => ({
        id: s.id,
        descricao: s.name,
        preco: Number(s.price),
      })),
    },
  ];
}

function mapReviews(reviews: ReviewList | null): Avaliacao[] {
  if (!reviews?.reviews?.length) return [];
  return reviews.reviews.map((r) => ({
    id: r.id,
    usuario: { nome: r.reviewerName },
    nota: r.rating,
    comentario: r.comment ?? "",
  }));
}

function mapTheme(theme: TenantThemeData | null): TenantTema | undefined {
  if (!theme) return undefined;
  return {
    corPrimaria: theme.corPrimaria,
    corSecundaria: theme.corSecundaria,
    corFundo: theme.corFundo,
    corTexto: theme.corTexto,
    fonte: theme.fonte as TenantTema["fonte"],
    borderRadius: theme.borderRadius as TenantTema["borderRadius"],
    secoesLayout: (theme.secoesLayout ?? []) as TenantTema["secoesLayout"],
  };
}

export interface MapEstabelecimentoInput {
  tenant: Tenant;
  professionals: PublicProfessional[];
  services: Service[];
  reviews: ReviewList | null;
  theme: TenantThemeData | null;
}

/** Converte os DTOs públicos da API no modelo de view usado pelos componentes de vitrine. */
export function mapToEstabelecimento({
  tenant,
  professionals,
  services,
  reviews,
  theme,
}: MapEstabelecimentoInput): Estabelecimento {
  const instagram = tenant.socialMedia?.instagram;
  const facebook = tenant.socialMedia?.facebook;

  return {
    id: tenant.id,
    slug: tenant.slug,
    nome: tenant.name,
    categoria: tenant.segment
      ? SEGMENT_TO_CATEGORIA[tenant.segment]
      : "barbearia",
    // API de tenant não tem description — vitrine monta bloco de contato/info.
    descricao: "",
    banner: tenant.socialMedia?.banner || tenant.avatarUrl || undefined,
    telefone: tenant.telephone || undefined,
    latitude: tenant.latitude,
    longitude: tenant.longitude,
    redesSociais: {
      instagram: instagram || undefined,
      facebook: facebook || undefined,
    },
    localizacao: formatAddressLine(tenant.address),
    // GAP: não há endpoint público de horários da loja → seção omitida na página.
    horarios: [],
    servicos: mapServices(services),
    time: mapProfessionals(professionals),
    avaliacoes: mapReviews(reviews),
    tema: mapTheme(theme),
  };
}
