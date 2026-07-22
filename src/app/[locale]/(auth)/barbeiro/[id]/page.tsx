"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Star,
  Loader2,
  CalendarClock,
  Award,
  MessageSquare,
  UserCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usersService } from "@/lib/api/services/users.service";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { tenantProfessionalsService } from "@/lib/api/services/tenant-professionals.service";
import { bookingService } from "@/lib/api/services/booking.service";
import { useTenantContext } from "@/components/providers/TenantProvider";
import {
  BookingStatus,
  OpsBooking,
  ProfessionalType,
} from "@/lib/api/types";
import { formatApiError } from "@/lib/api/errors";

const TYPE_LABEL: Record<ProfessionalType, string> = {
  [ProfessionalType.BARBER]: "Barbeiro",
  [ProfessionalType.TATTOO_ARTIST]: "Tatuador(a)",
  [ProfessionalType.HAIRDRESSER]: "Cabeleireiro(a)",
  [ProfessionalType.MANICURE]: "Manicure",
  [ProfessionalType.ESTHETICIAN]: "Esteticista",
  [ProfessionalType.LASH_DESIGNER]: "Lash Designer",
  [ProfessionalType.EYEBROW_DESIGNER]: "Designer de Sobrancelhas",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function customerName(b: OpsBooking): string {
  if (b.customer.kind === "GUEST") {
    return b.customer.guestName?.trim() || "Visitante";
  }
  return "Cliente";
}

export default function ProfissionalDashboardPage() {
  const t = useTranslations("BarbeiroDashboard");
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id;
  const { current, isLoading: tenantLoading } = useTenantContext();
  const tenantId = current?.tenant.id;

  const meQuery = useQuery({
    queryKey: ["me", sessionUserId],
    queryFn: () => usersService.getMe(),
    enabled: !!sessionUserId,
  });

  const profileQuery = useQuery({
    queryKey: ["my-professional-profile", sessionUserId],
    queryFn: () => usersService.getProfessionalProfile(),
    enabled: !!sessionUserId,
    retry: false,
  });

  const teamQuery = useQuery({
    queryKey: ["barbeiro-tp", sessionUserId, tenantId],
    queryFn: () => tenantProfessionalsService.list(tenantId!, true),
    enabled: !!tenantId && !!sessionUserId,
  });

  const myTp = useMemo(() => {
    const userId = meQuery.data?.id;
    const profileId = profileQuery.isSuccess
      ? profileQuery.data?.id
      : undefined;
    if (!teamQuery.data || (!userId && !profileId)) return null;
    return (
      teamQuery.data.find(
        (tp) =>
          tp.professionalProfile?.id === profileId ||
          tp.professionalProfile?.userId === userId,
      ) ?? null
    );
  }, [
    teamQuery.data,
    meQuery.data?.id,
    profileQuery.isSuccess,
    profileQuery.data?.id,
  ]);

  const userId = meQuery.data?.id;
  const reviewsQuery = useQuery({
    queryKey: ["professional-reviews", userId],
    queryFn: () => reviewsService.listProfessional(userId!),
    enabled: !!userId,
    retry: false,
  });

  const agendaQuery = useQuery({
    queryKey: ["barbeiro-agenda", sessionUserId, tenantId, myTp?.id, todayISO()],
    queryFn: () =>
      bookingService.listByProfessional(tenantId!, myTp!.id, {
        date: todayISO(),
      }),
    enabled: !!tenantId && !!myTp?.id && !!sessionUserId,
  });

  if (
    !sessionUserId ||
    meQuery.isLoading ||
    profileQuery.isLoading ||
    tenantLoading
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profile = profileQuery.data;

  if (!profile) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-32 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UserCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">{t("noProfileTitle")}</h1>
        <p className="text-muted-foreground">{t("noProfileDesc")}</p>
      </div>
    );
  }

  const reviews = reviewsQuery.data;
  const rating =
    reviews && reviews.totalReviews > 0
      ? reviews.averageRating.toFixed(1)
      : "—";

  const agenda = agendaQuery.data ?? [];
  const activeToday = agenda.filter((b) => b.status !== BookingStatus.CANCELLED);
  const confirmedToday = activeToday.filter(
    (b) => b.status === BookingStatus.CONFIRMED,
  ).length;
  const draftToday = activeToday.filter(
    (b) => b.status === BookingStatus.DRAFT,
  ).length;

  return (
    <main className="min-h-screen pb-24 pt-24">
      <div className="container mx-auto max-w-5xl px-4">
        <section className="mb-10 flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/50">
            <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            <AvatarFallback className="rounded-2xl bg-primary/20 text-xl font-bold text-primary">
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {t("hello")} {profile.displayName.split(" ")[0]}
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                {TYPE_LABEL[profile.professionalType] ?? t("proBadge")}
              </span>
            </h1>
            <p className="text-muted-foreground">{t("dailySummary")}</p>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            icon={<Star className="h-5 w-5 text-yellow-500" />}
            value={rating}
            label={t("fiveStarReviews")}
          />
          <KpiCard
            icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
            value={String(reviews?.totalReviews ?? 0)}
            label={t("reviews")}
          />
          <KpiCard
            icon={<Award className="h-5 w-5 text-emerald-500" />}
            value={String(confirmedToday)}
            label={t("completedToday")}
          />
          <KpiCard
            icon={<CalendarClock className="h-5 w-5 text-purple-500" />}
            value={String(draftToday + confirmedToday)}
            label={t("inQueueToday")}
          />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">{t("activeSchedule")}</h2>

          {!tenantId || !myTp ? (
            <p className="text-sm text-muted-foreground">{t("scheduleGap")}</p>
          ) : agendaQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : agendaQuery.isError ? (
            <p className="text-sm text-destructive">
              {formatApiError(agendaQuery.error)}
            </p>
          ) : activeToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("emptyAgenda")}</p>
          ) : (
            <div className="space-y-2">
              {activeToday.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        {b.startTime}
                      </span>
                      <span className="truncate text-sm">{b.service.name}</span>
                      <Badge
                        className={
                          b.status === BookingStatus.CONFIRMED
                            ? "bg-primary/15 text-primary"
                            : "bg-amber-500/15 text-amber-500"
                        }
                      >
                        {b.status === BookingStatus.CONFIRMED
                          ? "Confirmado"
                          : "Rascunho"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("agendaCustomer")}: {customerName(b)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {b.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {reviews && reviews.reviews.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold">{t("latestReviews")}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {reviews.reviews.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{r.reviewerName}</span>
                    <span className="flex items-center gap-1 text-sm text-primary">
                      <Star className="h-3.5 w-3.5 fill-primary" />
                      {r.rating}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm italic text-muted-foreground">
                      &quot;{r.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/50 bg-card p-4">
      <div className="mb-2">{icon}</div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
