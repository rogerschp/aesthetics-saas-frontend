"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatPriceBRL } from "@/lib/utils";
import {
  BookingMode,
  Booking,
  PublicProfessional,
  Service,
} from "@/lib/api/types";
import { availabilityService } from "@/lib/api/services/availability.service";
import { bookingService } from "@/lib/api/services/booking.service";
import { formatApiError, parseApiError } from "@/lib/api/errors";
import { maskPhoneBR } from "@/lib/masks";

interface BookingWizardProps {
  tenantId: string;
  professionals: PublicProfessional[];
  services: Service[];
  /** Fallback se o profissional não tiver whatsappNumber próprio. */
  tenantPhone?: string | null;
  tenantName?: string | null;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

type Step = "professional" | "service" | "slot" | "identity" | "done";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function digitsPhone(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

/** WhatsApp do profissional, com fallback no telefone da unidade. */
function professionalWhatsAppHref(
  professional: PublicProfessional,
  tenantPhone?: string | null,
  tenantName?: string | null,
): string | null {
  const digits =
    digitsPhone(professional.whatsappNumber) || digitsPhone(tenantPhone);
  if (!digits) return null;

  const place = tenantName ? ` (${tenantName})` : "";
  const msg =
    professional.bookingMode === BookingMode.QUOTE_REQUIRED
      ? `Olá! Gostaria de um orçamento com ${professional.displayName}${place}.`
      : `Olá! Gostaria de agendar com ${professional.displayName}${place}.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export function BookingWizard({
  tenantId,
  professionals,
  services,
  tenantPhone,
  tenantName,
  trigger,
  triggerClassName,
}: BookingWizardProps) {
  const t = useTranslations("Booking");
  const { status } = useSession();
  const isLogged = status === "authenticated";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("professional");
  const [professional, setProfessional] = useState<PublicProfessional | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>(todayISO());
  const [slot, setSlot] = useState<string | null>(null);
  const [guest, setGuest] = useState({ name: "", phone: "", email: "" });
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeServices = useMemo(
    () => services.filter((s) => s.isActive),
    [services],
  );

  const slotsQuery = useQuery({
    queryKey: ["public-slots", tenantId, professional?.id, service?.id, date],
    queryFn: () =>
      availabilityService.getAvailableSlotsPublic(
        tenantId,
        professional!.id,
        service!.id,
        date,
      ),
    enabled: open && step === "slot" && !!professional && !!service && !!date,
  });

  const draftMutation = useMutation({
    mutationFn: async () => {
      if (!professional || !service || !slot) throw new Error("incompleto");
      const payload = { serviceId: service.id, date, startTime: slot };
      if (isLogged) {
        const draft = await bookingService.createPublicDraft(
          tenantId,
          professional.id,
          payload,
        );
        // Cliente logado: confirmar explicitamente (sem auto-confirm).
        return bookingService.confirmPublic(tenantId, professional.id, draft.id);
      }
      return bookingService.createGuestDraft(tenantId, professional.id, {
        ...payload,
        guestName: guest.name.trim(),
        guestPhone: guest.phone.trim(),
        guestEmail: guest.email.trim() || undefined,
      });
    },
    onSuccess: (booking) => {
      setResult(booking);
      setError(null);
      setStep("done");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      // Slot tomado por corrida → voltar para escolher outro horário.
      if (parsed.code === "SLOT_NOT_AVAILABLE") {
        setError(formatApiError(err));
        setStep("slot");
        setSlot(null);
        slotsQuery.refetch();
        return;
      }
      setError(formatApiError(err));
    },
  });

  function reset() {
    setStep("professional");
    setProfessional(null);
    setService(null);
    setDate(todayISO());
    setSlot(null);
    setGuest({ name: "", phone: "", email: "" });
    setResult(null);
    setError(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  function selectProfessional(p: PublicProfessional) {
    setProfessional(p);
    setError(null);
    if (p.bookingMode !== BookingMode.DIRECT_BOOKING) {
      // Orçamento / só WhatsApp → abre o WA na hora (sem seguir o fluxo de slots).
      const href = professionalWhatsAppHref(p, tenantPhone, tenantName);
      if (href && typeof window !== "undefined") {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      return;
    }
    setStep("service");
  }

  const nonBookable =
    professional && professional.bookingMode !== BookingMode.DIRECT_BOOKING;

  const guestValid =
    guest.name.trim().length >= 1 && guest.phone.replace(/\D/g, "").length >= 8;

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button
          size="lg"
          className={cn("w-full font-semibold", triggerClassName)}
          onClick={() => setOpen(true)}
        >
          <Calendar className="mr-2 h-5 w-5" />
          {t("schedule")}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl md:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                {step !== "professional" && step !== "done" && (
                  <button
                    onClick={() => {
                      setError(null);
                      if (step === "service") setStep("professional");
                      else if (step === "slot") setStep("service");
                      else if (step === "identity") setStep("slot");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={t("back")}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-base font-semibold">{t("newBooking")}</h2>
              </div>
              <button
                onClick={close}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Passo 1: Profissional */}
              {step === "professional" && (
                <div className="space-y-2">
                  <p className="mb-2 text-sm text-muted-foreground">
                    {t("chooseProfessional")}
                  </p>
                  {professionals.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("noProfessionals")}
                    </p>
                  )}
                  {professionals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectProfessional(p)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/60",
                        professional?.id === p.id &&
                          p.bookingMode !== BookingMode.DIRECT_BOOKING
                          ? "border-primary/60 bg-primary/5"
                          : "border-border/60",
                      )}
                    >
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={p.avatarUrl} alt={p.displayName} />
                        <AvatarFallback>
                          {p.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.displayName}
                        </p>
                        {p.bookingMode !== BookingMode.DIRECT_BOOKING && (
                          <span className="text-xs text-amber-500">
                            {p.bookingMode === BookingMode.WHATSAPP_ONLY
                              ? t("viaWhatsapp")
                              : t("viaQuote")}
                          </span>
                        )}
                      </div>
                      {p.bookingMode !== BookingMode.DIRECT_BOOKING && (
                        <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}

                  {nonBookable && (
                    <NonBookableNotice
                      professional={professional!}
                      tenantPhone={tenantPhone}
                      tenantName={tenantName}
                    />
                  )}
                </div>
              )}

              {/* Passo 2: Serviço */}
              {step === "service" && !nonBookable && (
                <div className="space-y-2">
                  <p className="mb-2 text-sm text-muted-foreground">
                    {t("chooseService")}
                  </p>
                  {activeServices.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("noServices")}
                    </p>
                  )}
                  {activeServices.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setService(s);
                        setSlot(null);
                        setStep("slot");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-border/60 p-3 text-left transition-colors hover:border-primary/60"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("durationMin", { minutes: s.durationInMinutes })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {formatPriceBRL(s.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Passo 3: Data + slot */}
              {step === "slot" && !nonBookable && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="booking-date" className="mb-1.5 block text-sm">
                      {t("date")}
                    </Label>
                    <Input
                      id="booking-date"
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
                    <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {t("availableSlots")}
                    </p>
                    {slotsQuery.isFetching && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {slotsQuery.isError && (
                      <p className="text-sm text-destructive">
                        {formatApiError(slotsQuery.error)}
                      </p>
                    )}
                    {slotsQuery.data && slotsQuery.data.slots.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t("noSlots")}
                      </p>
                    )}
                    {slotsQuery.data && slotsQuery.data.slots.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {slotsQuery.data.slots.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSlot(s)}
                            className={cn(
                              "rounded-lg border py-2 text-sm transition-colors",
                              slot === s
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/60 hover:border-primary/60",
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!slot}
                    onClick={() => setStep("identity")}
                  >
                    {t("continue")}
                  </Button>
                </div>
              )}

              {/* Passo 4: Identidade / confirmação */}
              {step === "identity" && !nonBookable && (
                <div className="space-y-4">
                  <BookingSummary
                    professional={professional!}
                    service={service!}
                    date={date}
                    slot={slot!}
                  />

                  {!isLogged && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {t("yourData")}
                      </p>
                      <div>
                        <Label htmlFor="guest-name" className="mb-1.5 block text-sm">
                          {t("nameRequired")}
                        </Label>
                        <Input
                          id="guest-name"
                          value={guest.name}
                          onChange={(e) =>
                            setGuest((g) => ({ ...g, name: e.target.value }))
                          }
                          placeholder={t("namePlaceholder")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-phone" className="mb-1.5 block text-sm">
                          {t("phoneRequired")}
                        </Label>
                        <Input
                          id="guest-phone"
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
                        <Label htmlFor="guest-email" className="mb-1.5 block text-sm">
                          {t("emailOptional")}
                        </Label>
                        <Input
                          id="guest-email"
                          type="email"
                          value={guest.email}
                          onChange={(e) =>
                            setGuest((g) => ({ ...g, email: e.target.value }))
                          }
                          placeholder={t("emailPlaceholder")}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={
                      draftMutation.isPending || (!isLogged && !guestValid)
                    }
                    onClick={() => draftMutation.mutate()}
                  >
                    {draftMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLogged ? t("confirm") : t("request")}
                  </Button>
                  {!isLogged && (
                    <p className="text-center text-xs text-muted-foreground">
                      {t("haveAccount")}{" "}
                      <a href="/login" className="text-primary underline">
                        {t("signIn")}
                      </a>{" "}
                      {t("toConfirmNow")}
                    </p>
                  )}
                </div>
              )}

              {/* Passo 5: Sucesso */}
              {step === "done" && result && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-7 w-7 text-primary" />
                  </div>
                  {isLogged ? (
                    <>
                      <h3 className="text-lg font-semibold">
                        {t("confirmedTitle")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("confirmedDesc")}
                      </p>
                      <a
                        href="/perfil/me"
                        className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full")}
                      >
                        {t("viewMyBookings")}
                      </a>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">
                        {t("requestedTitle")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("requestedDesc")}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={close}
                      >
                        {t("done")}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BookingSummary({
  professional,
  service,
  date,
  slot,
}: {
  professional: PublicProfessional;
  service: Service;
  date: string;
  slot: string;
}) {
  const t = useTranslations("Booking");
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-sm">
      <div className="flex justify-between py-1">
        <span className="text-muted-foreground">{t("summaryProfessional")}</span>
        <span className="font-medium">{professional.displayName}</span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-muted-foreground">{t("summaryService")}</span>
        <span className="font-medium">{service.name}</span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-muted-foreground">{t("summaryDate")}</span>
        <span className="font-medium">
          {new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")}
        </span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-muted-foreground">{t("summaryTime")}</span>
        <span className="font-medium">{slot}</span>
      </div>
    </div>
  );
}

function NonBookableNotice({
  professional,
  tenantPhone,
  tenantName,
}: {
  professional: PublicProfessional;
  tenantPhone?: string | null;
  tenantName?: string | null;
}) {
  const t = useTranslations("Booking");
  const isWhatsapp = professional.bookingMode === BookingMode.WHATSAPP_ONLY;
  const waHref = professionalWhatsAppHref(
    professional,
    tenantPhone,
    tenantName,
  );

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
      <p className="text-sm text-muted-foreground">
        {isWhatsapp
          ? t("whatsappOnly", { name: professional.displayName })
          : t("quoteOnly", { name: professional.displayName })}
      </p>
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {t("talkWhatsapp")}
        </a>
      ) : (
        <p className="text-xs text-destructive">{t("noWhatsapp")}</p>
      )}
    </div>
  );
}
