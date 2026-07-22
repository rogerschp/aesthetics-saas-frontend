"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  CalendarClock,
  Clock,
  Loader2,
  MapPin,
  History,
  X,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usersService } from "@/lib/api/services/users.service";
import { bookingService } from "@/lib/api/services/booking.service";
import { BookingStatus, MyBooking } from "@/lib/api/types";
import { formatApiError } from "@/lib/api/errors";
import { formatAddressLine } from "@/lib/utils";

const STATUS_KEY: Record<BookingStatus, string> = {
  [BookingStatus.DRAFT]: "statusDraft",
  [BookingStatus.CONFIRMED]: "statusConfirmed",
  [BookingStatus.CANCELLED]: "statusCancelled",
};

function statusVariant(status: BookingStatus): string {
  if (status === BookingStatus.CONFIRMED) return "bg-primary/15 text-primary";
  if (status === BookingStatus.DRAFT) return "bg-amber-500/15 text-amber-500";
  return "bg-muted text-muted-foreground";
}

function formatDate(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function ProfileBookings() {
  const t = useTranslations("MeusAgendamentos");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-bookings", userId],
    queryFn: () => usersService.getMyBookings(),
    enabled: !!userId,
  });

  const cancelMutation = useMutation({
    mutationFn: (b: MyBooking) =>
      bookingService.cancelPublic(
        b.tenant.id,
        b.professional.tenantProfessionalId,
        b.id,
      ),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["my-bookings", userId] });
    },
    onError: (err) => setActionError(formatApiError(err)),
  });

  const confirmMutation = useMutation({
    mutationFn: (b: MyBooking) =>
      bookingService.confirmPublic(
        b.tenant.id,
        b.professional.tenantProfessionalId,
        b.id,
      ),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["my-bookings", userId] });
    },
    onError: (err) => setActionError(formatApiError(err)),
  });

  const { upcoming, history } = useMemo(() => {
    const now = Date.now();
    const all = data ?? [];
    const up: MyBooking[] = [];
    const hist: MyBooking[] = [];
    for (const b of all) {
      const isFuture = new Date(b.startsAt).getTime() >= now;
      if (b.status !== BookingStatus.CANCELLED && isFuture) up.push(b);
      else hist.push(b);
    }
    up.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    hist.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    return { upcoming: up, history: hist };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {formatApiError(error)}
      </p>
    );
  }

  const pending = cancelMutation.isPending || confirmMutation.isPending;

  return (
    <div className="space-y-10">
      {actionError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <CalendarClock className="h-5 w-5 text-primary" />
          {t("upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noUpcoming")}</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingItem
                key={b.id}
                booking={b}
                pending={pending}
                onCancel={() => cancelMutation.mutate(b)}
                onConfirm={
                  b.status === BookingStatus.DRAFT
                    ? () => confirmMutation.mutate(b)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <History className="h-5 w-5 text-muted-foreground" />
          {t("history")}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
        ) : (
          <div className="space-y-3">
            {history.map((b) => (
              <BookingItem key={b.id} booking={b} pending={pending} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingItem({
  booking,
  pending,
  onCancel,
  onConfirm,
}: {
  booking: MyBooking;
  pending: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}) {
  const t = useTranslations("MeusAgendamentos");
  const canCancel =
    onCancel &&
    (booking.status === BookingStatus.DRAFT ||
      booking.status === BookingStatus.CONFIRMED);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-foreground">
            {booking.service.name}
          </p>
          <Badge className={statusVariant(booking.status)}>
            {t(STATUS_KEY[booking.status])}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {booking.tenant.name} • {booking.professional.displayName}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(booking.date)} • {booking.startTime}
          </span>
          {booking.tenant.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {formatAddressLine(booking.tenant.address)}
            </span>
          )}
        </div>
      </div>

      {(canCancel || onConfirm) && (
        <div className="flex shrink-0 gap-2">
          {onConfirm && (
            <Button size="sm" disabled={pending} onClick={onConfirm}>
              <Check className="mr-1.5 h-4 w-4" />
              {t("confirm")}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={onCancel}
            >
              <X className="mr-1.5 h-4 w-4" />
              {t("cancel")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
