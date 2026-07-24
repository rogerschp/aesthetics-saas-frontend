"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Check,
  Loader2,
  Pencil,
  Power,
  Scissors,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersService } from "@/lib/api/services/users.service";
import {
  BookingMode,
  MediaType,
  ProfessionalProfile,
  ProfessionalType,
} from "@/lib/api/types";
import { formatApiError } from "@/lib/api/errors";
import { maskPhoneBR, phoneToApiDigits } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { MediaImageField } from "@/components/shared/MediaImageField";
import {
  MediaGalleryField,
  type GalleryItem,
} from "@/components/shared/MediaGalleryField";

const TYPE_OPTIONS: { value: ProfessionalType; labelKey: string }[] = [
  { value: ProfessionalType.BARBER, labelKey: "typeBarber" },
  { value: ProfessionalType.HAIRDRESSER, labelKey: "typeHairdresser" },
  { value: ProfessionalType.TATTOO_ARTIST, labelKey: "typeTattoo" },
  { value: ProfessionalType.MANICURE, labelKey: "typeManicure" },
  { value: ProfessionalType.ESTHETICIAN, labelKey: "typeEsthetician" },
  { value: ProfessionalType.LASH_DESIGNER, labelKey: "typeLash" },
  { value: ProfessionalType.EYEBROW_DESIGNER, labelKey: "typeEyebrow" },
];

const BOOKING_MODE_OPTIONS: { value: BookingMode; labelKey: string }[] = [
  { value: BookingMode.DIRECT_BOOKING, labelKey: "modeDirect" },
  { value: BookingMode.QUOTE_REQUIRED, labelKey: "modeQuote" },
  { value: BookingMode.WHATSAPP_ONLY, labelKey: "modeWhatsapp" },
];

const selectClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

type FormState = {
  displayName: string;
  avatarUrl: string;
  professionalType: ProfessionalType;
  experienceYears: number;
  whatsappNumber: string;
  instagramUsername: string;
  bookingMode: BookingMode;
  bio: string;
};

const emptyForm = (fallbackName = ""): FormState => ({
  displayName: fallbackName,
  avatarUrl: "",
  professionalType: ProfessionalType.BARBER,
  experienceYears: 1,
  whatsappNumber: "",
  instagramUsername: "",
  bookingMode: BookingMode.DIRECT_BOOKING,
  bio: "",
});

function formFromProfile(profile: ProfessionalProfile): FormState {
  return {
    displayName: profile.displayName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    professionalType: profile.professionalType,
    experienceYears: profile.experienceYears ?? 0,
    whatsappNumber: maskPhoneBR(profile.whatsappNumber ?? ""),
    instagramUsername: profile.instagramUsername ?? "",
    bookingMode: profile.bookingMode ?? BookingMode.DIRECT_BOOKING,
    bio: profile.bio ?? "",
  };
}

function buildPayload(form: FormState, fallbackName: string) {
  const whatsappDigits = phoneToApiDigits(form.whatsappNumber);
  const instagram = form.instagramUsername.trim().replace(/^@/, "");
  return {
    displayName: form.displayName.trim() || fallbackName || "Profissional",
    professionalType: form.professionalType,
    experienceYears: Math.max(0, Number(form.experienceYears) || 0),
    bookingMode: form.bookingMode,
    whatsappNumber: whatsappDigits || undefined,
    instagramUsername: instagram || undefined,
    bio: form.bio.trim() || null,
  };
}

type ProfessionalProfileCardProps = {
  /** Quando já estamos em /barbeiro, esconde o atalho “Ver minha agenda”. */
  hideDashboardLink?: boolean;
};

export function ProfessionalProfileCard({
  hideDashboardLink = false,
}: ProfessionalProfileCardProps = {}) {
  const t = useTranslations("PerfilPro");
  const tMedia = useTranslations("MediaUpload");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me", userId],
    queryFn: () => usersService.getMe(),
    enabled: !!userId,
  });

  const profileQuery = useQuery({
    queryKey: ["my-professional-profile", userId],
    queryFn: () => usersService.getProfessionalProfile(),
    enabled: !!userId,
    retry: false,
  });

  const profile = profileQuery.isSuccess ? profileQuery.data : null;

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["my-professional-profile", userId] });
    queryClient.invalidateQueries({ queryKey: ["me", userId] });
  }

  const createMutation = useMutation({
    mutationFn: () =>
      usersService.createProfessionalProfile(
        buildPayload(form, meQuery.data?.name ?? ""),
      ),
    onSuccess: () => {
      setError(null);
      setMode("view");
      invalidate();
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      usersService.updateProfessionalProfile(
        buildPayload(form, meQuery.data?.name ?? ""),
      ),
    onSuccess: () => {
      setError(null);
      setSaved(true);
      setMode("view");
      invalidate();
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => usersService.deactivateProfessionalProfile(),
    onSuccess: () => {
      setError(null);
      setMode("view");
      invalidate();
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const activateMutation = useMutation({
    mutationFn: () => usersService.activateProfessionalProfile(),
    onSuccess: () => {
      setError(null);
      setMode("view");
      invalidate();
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deactivateMutation.isPending ||
    activateMutation.isPending;

  if (!userId || meQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border border-border/50 bg-card p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function renderForm(isEdit: boolean) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h3 className="mb-4 text-lg font-bold">
          {isEdit ? t("editTitle") : t("formTitle")}
        </h3>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm">{t("displayName")}</Label>
            <Input
              value={form.displayName}
              onChange={(e) => patchForm("displayName", e.target.value)}
              placeholder={meQuery.data?.name}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">{t("type")}</Label>
            <select
              value={form.professionalType}
              onChange={(e) =>
                patchForm("professionalType", e.target.value as ProfessionalType)
              }
              className={selectClass}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">{t("experience")}</Label>
            <Input
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) =>
                patchForm("experienceYears", Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">{t("bookingMode")}</Label>
            <select
              value={form.bookingMode}
              onChange={(e) =>
                patchForm("bookingMode", e.target.value as BookingMode)
              }
              className={selectClass}
            >
              {BOOKING_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">{t("whatsapp")}</Label>
            <Input
              value={form.whatsappNumber}
              onChange={(e) =>
                patchForm("whatsappNumber", maskPhoneBR(e.target.value))
              }
              placeholder="(11) 99999-9999"
              inputMode="tel"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">{t("instagram")}</Label>
            <Input
              value={form.instagramUsername}
              onChange={(e) => patchForm("instagramUsername", e.target.value)}
              placeholder="@usuario"
            />
          </div>
          <div className="sm:col-span-2">
            {isEdit && userId ? (
              <MediaImageField
                label={t("avatarUrl")}
                hint={tMedia("avatarHint")}
                mediaType={MediaType.AVATAR}
                context={{ professionalId: userId }}
                value={form.avatarUrl || null}
                onLink={async (media) => {
                  await usersService.setProfessionalAvatar(media.id);
                  invalidate();
                }}
                onChange={(url) => patchForm("avatarUrl", url ?? "")}
                variant="square"
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                {tMedia("proAvatarAfterCreate")}
              </p>
            )}
          </div>
          {isEdit && userId && (
            <div className="sm:col-span-2">
              <MediaGalleryField
                label={tMedia("gallery")}
                hint={tMedia("galleryHint")}
                professionalId={userId}
                items={gallery}
                onChange={setGallery}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block text-sm">{t("bio")}</Label>
            <textarea
              value={form.bio}
              onChange={(e) => patchForm("bio", e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={t("bioPlaceholder")}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={busy}
            onClick={() =>
              isEdit ? updateMutation.mutate() : createMutation.mutate()
            }
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {isEdit ? t("save") : t("create")}
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setError(null);
              setMode("view");
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return renderForm(false);
  }

  if (mode === "edit" && profile) {
    return renderForm(true);
  }

  if (profile) {
    const typeLabel =
      TYPE_OPTIONS.find((o) => o.value === profile.professionalType)?.labelKey ??
      null;
    const modeLabel =
      BOOKING_MODE_OPTIONS.find((o) => o.value === profile.bookingMode)
        ?.labelKey ?? null;

    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{t("hasProfileTitle")}</h3>
          {!profile.isActive && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">
              {t("inactiveBadge")}
            </span>
          )}
        </div>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {saved && (
          <p className="mb-3 text-sm text-primary">{t("saved")}</p>
        )}
        <p className="mb-1 text-sm text-foreground">{profile.displayName}</p>
        <p className="mb-1 text-xs text-muted-foreground">
          {typeLabel ? t(typeLabel) : profile.professionalType} ·{" "}
          {profile.experienceYears} {t("years")}
        </p>
        {modeLabel && (
          <p className="mb-1 text-xs text-muted-foreground">{t(modeLabel)}</p>
        )}
        {profile.bio && (
          <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
            {profile.bio}
          </p>
        )}
        {!profile.bio && <div className="mb-4" />}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setSaved(false);
              setForm(formFromProfile(profile));
              setMode("edit");
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("editBtn")}
          </Button>
          {!hideDashboardLink && (
            <Link
              href={`/barbeiro/${meQuery.data?.id ?? "me"}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Scissors className="mr-2 h-4 w-4" />
              {t("goDashboard")}
            </Link>
          )}
          {profile.isActive ? (
            <Button
              variant="ghost"
              className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
              disabled={busy}
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  !window.confirm(t("deactivateConfirm"))
                ) {
                  return;
                }
                deactivateMutation.mutate();
              }}
            >
              {deactivateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}
              {t("deactivate")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              disabled={busy}
              onClick={() => activateMutation.mutate()}
            >
              {activateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}
              {t("activate")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <Scissors className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">{t("becomeTitle")}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{t("becomeDesc")}</p>
      <Button
        onClick={() => {
          setError(null);
          setForm(emptyForm(meQuery.data?.name ?? ""));
          setMode("create");
        }}
      >
        {t("becomeBtn")}
      </Button>
    </div>
  );
}
