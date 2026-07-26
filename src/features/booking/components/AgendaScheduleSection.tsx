"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/shared/ui/badge";
import {
  DateRangeFields,
  defaultRange,
} from "@/shared/components/DateRangeFields";
import { BookingStatus } from "@/shared/lib/api/types";
import { OpsBooking } from "@/features/booking/model/booking.types";
import { formatApiError } from "@/shared/lib/api/errors";

const MAX_RANGE_DAYS = 31;

function customerName(b: OpsBooking): string {
  if (b.customer.kind === "GUEST") {
    return b.customer.guestName?.trim() || "Visitante";
  }
  return "Cliente";
}

interface AgendaScheduleSectionProps {
  range: { from: string; to: string };
  onRangeChange: (range: { from: string; to: string }) => void;
  rangeError: string | null;
  hasSchedule: boolean;
  bookings: OpsBooking[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

/** Seção "Agenda ativa" do dashboard do profissional (`/barbeiro/[id]`). */
export function AgendaScheduleSection({
  range,
  onRangeChange,
  rangeError,
  hasSchedule,
  bookings,
  isLoading,
  isError,
  error,
}: AgendaScheduleSectionProps) {
  const t = useTranslations("BarbeiroDashboard");

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-bold">{t("activeSchedule")}</h2>
        <DateRangeFields
          from={range.from}
          to={range.to}
          onFromChange={(from) => onRangeChange({ ...range, from })}
          onToChange={(to) => onRangeChange({ ...range, to })}
          fromLabel={t("from")}
          toLabel={t("to")}
          maxDays={MAX_RANGE_DAYS}
          rangeError={rangeError}
          onClear={() => onRangeChange(defaultRange(0, 0))}
          clearLabel={t("rangeToday")}
        />
      </div>

      {!hasSchedule ? (
        <p className="text-sm text-muted-foreground">{t("scheduleGap")}</p>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">{formatApiError(error)}</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyAgenda")}</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
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
                        : b.status === BookingStatus.COMPLETED
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500"
                    }
                  >
                    {b.status === BookingStatus.CONFIRMED
                      ? t("statusConfirmed")
                      : b.status === BookingStatus.COMPLETED
                        ? t("statusCompleted")
                        : t("statusDraft")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {b.date} · {t("agendaCustomer")}: {customerName(b)}
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
  );
}
