"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarPlus, Check, CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  useOpsProfessionals,
  useOpsServices,
  useOpsSlots,
  useOpsAgenda,
  useInvalidateOpsAgenda,
  useCreateOpsBookingDraft,
  useOpsBookingAction,
} from "@/features/booking/hooks/useOpsBooking";
import { BookingStatus } from "@/shared/lib/api/types";
import { OpsBooking } from "@/features/booking/model/booking.types";
import { formatApiError } from "@/shared/lib/api/errors";
import { maskPhoneBR } from "@/shared/lib/masks";
import {
  DateRangeFields,
  daysInclusive,
  defaultRange,
} from "@/shared/components/DateRangeFields";

type Identity = "none" | "guest";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_KEY: Record<BookingStatus, string> = {
  [BookingStatus.DRAFT]: "statusDraft",
  [BookingStatus.CONFIRMED]: "statusConfirmed",
  [BookingStatus.CANCELLED]: "statusCancelled",
  [BookingStatus.COMPLETED]: "statusCompleted",
};

function customerLabel(b: OpsBooking, t: (k: string) => string): string {
  if (b.customer.kind === "GUEST") {
    return b.customer.guestName?.trim() || t("guestFallback");
  }
  return t("walkIn");
}

const MAX_AGENDA_DAYS = 31;

export function OpsBookingPanel({ tenantId }: { tenantId: string }) {
  const t = useTranslations("Ops");

  const [professionalId, setProfessionalId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISO());
  const initialAgenda = defaultRange(0, 0);
  const [agendaFrom, setAgendaFrom] = useState(initialAgenda.from);
  const [agendaTo, setAgendaTo] = useState(initialAgenda.to);
  const [slot, setSlot] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity>("none");
  const [guest, setGuest] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);

  const agendaRangeError =
    agendaFrom && agendaTo
      ? agendaFrom > agendaTo
        ? t("rangeInvalid")
        : daysInclusive(agendaFrom, agendaTo) > MAX_AGENDA_DAYS
          ? t("rangeTooLarge", { max: MAX_AGENDA_DAYS })
          : null
      : t("rangeRequired");

  const professionalsQuery = useOpsProfessionals(tenantId);

  const servicesQuery = useOpsServices(tenantId);

  const slotsQuery = useOpsSlots(tenantId, professionalId, serviceId, date);

  const agendaQuery = useOpsAgenda(
    tenantId,
    agendaFrom,
    agendaTo,
    !agendaRangeError && !!agendaFrom && !!agendaTo,
  );

  const invalidateAgenda = useInvalidateOpsAgenda(tenantId);

  const draftMutation = useCreateOpsBookingDraft(tenantId, {
    onSuccess: () => {
      setError(null);
      setSlot(null);
      setGuest({ name: "", phone: "", email: "" });
      slotsQuery.refetch();
      if (date >= agendaFrom && date <= agendaTo) invalidateAgenda();
      else {
        setAgendaFrom(date);
        setAgendaTo(date);
      }
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const actionMutation = useOpsBookingAction(tenantId, {
    onSuccess: () => {
      setError(null);
      invalidateAgenda();
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const guestValid =
    identity === "none" ||
    (guest.name.trim().length >= 1 &&
      guest.phone.replace(/\D/g, "").length >= 8);

  const canSubmit = !!professionalId && !!serviceId && !!slot && guestValid;
  const agenda = agendaQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm">{t("professional")}</Label>
            <select
              value={professionalId}
              onChange={(e) => {
                setProfessionalId(e.target.value);
                setSlot(null);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">{t("select")}</option>
              {professionalsQuery.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.professionalProfile?.displayName ?? t("professionalFallback")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">{t("service")}</Label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setSlot(null);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">{t("select")}</option>
              {servicesQuery.data
                ?.filter((s) => s.isActive)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({t("durationMin", { minutes: s.durationInMinutes })})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label htmlFor="ops-date" className="mb-1.5 block text-sm">
              {t("date")}
            </Label>
            <Input
              id="ops-date"
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlot(null);
              }}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">{t("client")}</Label>
            <select
              value={identity}
              onChange={(e) => setIdentity(e.target.value as Identity)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="none">{t("identityNone")}</option>
              <option value="guest">{t("identityGuest")}</option>
            </select>
          </div>
        </div>

        {identity === "guest" && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="ops-guest-name" className="mb-1.5 block text-sm">
                {t("nameRequired")}
              </Label>
              <Input
                id="ops-guest-name"
                value={guest.name}
                onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ops-guest-phone" className="mb-1.5 block text-sm">
                {t("phoneRequired")}
              </Label>
              <Input
                id="ops-guest-phone"
                value={guest.phone}
                onChange={(e) =>
                  setGuest((g) => ({
                    ...g,
                    phone: maskPhoneBR(e.target.value),
                  }))
                }
                placeholder="(11) 99999-9999"
                inputMode="tel"
              />
            </div>
            <div>
              <Label htmlFor="ops-guest-email" className="mb-1.5 block text-sm">
                {t("emailOptional")}
              </Label>
              <Input
                id="ops-guest-email"
                type="email"
                value={guest.email}
                onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
              />
            </div>
          </div>
        )}

        {professionalId && serviceId && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> {t("availableSlots")}
            </p>
            {slotsQuery.isFetching && (
              <div className="flex py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {slotsQuery.isError && (
              <p className="text-sm text-destructive">
                {formatApiError(slotsQuery.error)}
              </p>
            )}
            {slotsQuery.data && slotsQuery.data.slots.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noSlots")}</p>
            )}
            {slotsQuery.data && slotsQuery.data.slots.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slotsQuery.data.slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={
                      "rounded-lg border py-2 text-sm transition-colors " +
                      (slot === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 hover:border-primary/60")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          className="mt-5"
          disabled={!canSubmit || draftMutation.isPending}
          onClick={() =>
            draftMutation.mutate({
              professionalId,
              serviceId,
              date,
              startTime: slot!,
              guestName: identity === "guest" ? guest.name.trim() : undefined,
              guestPhone: identity === "guest" ? guest.phone.trim() : undefined,
              guestEmail:
                identity === "guest" && guest.email.trim()
                  ? guest.email.trim()
                  : undefined,
            })
          }
        >
          {draftMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("createDraft")}
        </Button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-4 space-y-3">
          <p className="text-sm font-medium text-foreground">{t("dayAgenda")}</p>
          <DateRangeFields
            from={agendaFrom}
            to={agendaTo}
            onFromChange={setAgendaFrom}
            onToChange={setAgendaTo}
            fromLabel={t("from")}
            toLabel={t("to")}
            maxDays={MAX_AGENDA_DAYS}
            rangeError={agendaRangeError}
          />
        </div>

        {agendaQuery.isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {agendaQuery.isError && (
          <p className="text-sm text-destructive">
            {formatApiError(agendaQuery.error)}
          </p>
        )}
        {!agendaRangeError &&
          !agendaQuery.isLoading &&
          !agendaQuery.isError &&
          agenda.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("emptyAgenda")}</p>
          )}

        <div className="space-y-2">
          {agenda.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-2 rounded-lg border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium tabular-nums">
                    {booking.date} · {booking.startTime}
                  </span>
                  <span className="truncate text-sm">
                    {booking.service.name} • {booking.professional.displayName} •{" "}
                    {customerLabel(booking, t)}
                  </span>
                  <Badge
                    className={
                      booking.status === BookingStatus.CONFIRMED
                        ? "bg-primary/15 text-primary"
                        : booking.status === BookingStatus.COMPLETED
                          ? "bg-emerald-500/15 text-emerald-500"
                          : booking.status === BookingStatus.CANCELLED
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-500/15 text-amber-500"
                    }
                  >
                    {t(STATUS_KEY[booking.status])}
                  </Badge>
                </div>
                {booking.customer.kind === "GUEST" && booking.customer.guestPhone && (
                  <span className="text-xs text-muted-foreground">
                    {booking.customer.guestPhone}
                  </span>
                )}
              </div>
              {booking.status === BookingStatus.DRAFT && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    disabled={actionMutation.isPending}
                    onClick={() =>
                      actionMutation.mutate({ booking, action: "confirm" })
                    }
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    {t("confirm")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionMutation.isPending}
                    onClick={() =>
                      actionMutation.mutate({ booking, action: "cancel" })
                    }
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    {t("cancel")}
                  </Button>
                </div>
              )}
              {booking.status === BookingStatus.CONFIRMED && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    disabled={actionMutation.isPending}
                    onClick={() =>
                      actionMutation.mutate({ booking, action: "complete" })
                    }
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    {t("complete")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionMutation.isPending}
                    onClick={() =>
                      actionMutation.mutate({ booking, action: "cancel" })
                    }
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    {t("cancel")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
