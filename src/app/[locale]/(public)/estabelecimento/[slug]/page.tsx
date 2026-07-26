import { notFound } from "next/navigation";
import {
  EstabelecimentoPublicPage,
  loadTenantEstabelecimentoBase,
} from "@/features/tenant/components/estabelecimento/EstabelecimentoPublicPage";
import { mapToEstabelecimento } from "@/features/tenant/model/estabelecimento.mapper";
import { tenantProfessionalsService } from "@/features/professional/api/tenant-professionals.service";
import { reviewsService } from "@/features/reviews/api/reviews.service";
import { ReviewsWall } from "@/features/reviews/components/ReviewsWall";
import { BookingWizard } from "@/features/booking/components/BookingWizard";
import type { PublicProfessional, ReviewList } from "@/shared/lib/api/types";

interface EstabelecimentoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EstabelecimentoPage({
  params,
}: EstabelecimentoPageProps) {
  const { slug } = await params;

  const base = await loadTenantEstabelecimentoBase(slug);
  if (!base) notFound();

  const { tenant, services, theme } = base;

  const [professionals, reviews] = await Promise.all([
    tenantProfessionalsService
      .listPublic(tenant.id)
      .catch(() => [] as PublicProfessional[]),
    reviewsService.listTenant(tenant.id).catch(() => null as ReviewList | null),
  ]);

  const estabelecimento = mapToEstabelecimento({
    tenant,
    professionals,
    services,
    reviews,
    theme,
  });

  const bookingWizard = (
    <BookingWizard
      tenantId={tenant.id}
      professionals={professionals}
      services={services}
      tenantPhone={estabelecimento.telefone ?? tenant.telephone}
      tenantName={estabelecimento.nome ?? tenant.name}
    />
  );

  return (
    <EstabelecimentoPublicPage
      estabelecimento={estabelecimento}
      reviewsSection={<ReviewsWall tenantId={tenant.id} />}
      bookingWizard={bookingWizard}
    />
  );
}
