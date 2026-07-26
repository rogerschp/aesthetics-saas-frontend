"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProfessionalDashboard } from "@/features/professional/hooks/useProfessionalDashboard";
import { ProfessionalProfileCard } from "@/features/professional/components/ProfessionalProfileCard";
import { ProfessionalNoProfileState } from "@/features/professional/components/ProfessionalNoProfileState";
import { ProfessionalDashboardHeader } from "@/features/professional/components/ProfessionalDashboardHeader";
import { ProfessionalDashboardKpis } from "@/features/professional/components/ProfessionalDashboardKpis";
import { ProfessionalReviewsWall } from "@/features/reviews/components/ProfessionalReviewsWall";
import { AgendaScheduleSection } from "@/features/booking/components/AgendaScheduleSection";
import { useMyProfessionalAgenda } from "@/features/booking/hooks/useMyProfessionalAgenda";
import { BookingStatus } from "@/shared/lib/api/types";

export default function ProfissionalDashboardPage() {
  const t = useTranslations("BarbeiroDashboard");
  const dash = useProfessionalDashboard();

  const agendaQuery = useMyProfessionalAgenda(
    dash.sessionUserId,
    dash.tenantId,
    dash.myTpId,
    dash.range.from,
    dash.range.to,
    !dash.rangeError,
  );

  if (dash.isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dash.profile) {
    return <ProfessionalNoProfileState />;
  }

  const agenda = agendaQuery.data ?? [];
  const activeBookings = agenda.filter(
    (b) => b.status !== BookingStatus.CANCELLED,
  );
  const completedCount = activeBookings.filter(
    (b) => b.status === BookingStatus.COMPLETED,
  ).length;
  const inQueueCount = activeBookings.filter(
    (b) =>
      b.status === BookingStatus.DRAFT || b.status === BookingStatus.CONFIRMED,
  ).length;

  return (
    <main className="min-h-screen pb-24 pt-24">
      <div className="container mx-auto max-w-5xl px-4">
        <ProfessionalDashboardHeader profile={dash.profile} />

        <ProfessionalDashboardKpis
          rating={dash.rating}
          reviewsCount={dash.reviewsCount}
          completedCount={completedCount}
          inQueueCount={inQueueCount}
        />

        <AgendaScheduleSection
          range={dash.range}
          onRangeChange={dash.setRange}
          rangeError={dash.rangeError}
          hasSchedule={dash.hasSchedule}
          bookings={activeBookings}
          isLoading={agendaQuery.isLoading}
          isError={agendaQuery.isError}
          error={agendaQuery.error}
        />

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">{t("profileSection")}</h2>
          <ProfessionalProfileCard hideDashboardLink />
        </section>

        {dash.userId && (
          <section>
            <ProfessionalReviewsWall
              professionalUserId={dash.userId}
              canReply
              title={t("latestReviews")}
            />
          </section>
        )}
      </div>
    </main>
  );
}
