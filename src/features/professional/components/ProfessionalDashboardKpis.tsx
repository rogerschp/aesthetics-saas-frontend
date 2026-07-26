"use client";

import type { ReactNode } from "react";
import { Star, MessageSquare, Award, CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfessionalDashboardKpisProps {
  rating: string;
  reviewsCount: number;
  completedCount: number;
  inQueueCount: number;
}

export function ProfessionalDashboardKpis({
  rating,
  reviewsCount,
  completedCount,
  inQueueCount,
}: ProfessionalDashboardKpisProps) {
  const t = useTranslations("BarbeiroDashboard");

  return (
    <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard
        icon={<Star className="h-5 w-5 text-yellow-500" />}
        value={rating}
        label={t("fiveStarReviews")}
      />
      <KpiCard
        icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
        value={String(reviewsCount)}
        label={t("reviews")}
      />
      <KpiCard
        icon={<Award className="h-5 w-5 text-emerald-500" />}
        value={String(completedCount)}
        label={t("completedToday")}
      />
      <KpiCard
        icon={<CalendarClock className="h-5 w-5 text-purple-500" />}
        value={String(inQueueCount)}
        label={t("inQueueToday")}
      />
    </section>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
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
