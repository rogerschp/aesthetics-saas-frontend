"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Check,
  Loader2,
  Scissors,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersService } from "@/lib/api/services/users.service";
import { BookingMode, ProfessionalType } from "@/lib/api/types";
import { formatApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: ProfessionalType; labelKey: string }[] = [
  { value: ProfessionalType.BARBER, labelKey: "typeBarber" },
  { value: ProfessionalType.HAIRDRESSER, labelKey: "typeHairdresser" },
  { value: ProfessionalType.TATTOO_ARTIST, labelKey: "typeTattoo" },
  { value: ProfessionalType.MANICURE, labelKey: "typeManicure" },
  { value: ProfessionalType.ESTHETICIAN, labelKey: "typeEsthetician" },
  { value: ProfessionalType.LASH_DESIGNER, labelKey: "typeLash" },
  { value: ProfessionalType.EYEBROW_DESIGNER, labelKey: "typeEyebrow" },
];

export function ProfessionalProfileCard() {
  const t = useTranslations("PerfilPro");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/150");
  const [professionalType, setProfessionalType] = useState(ProfessionalType.BARBER);
  const [experienceYears, setExperienceYears] = useState(1);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const createMutation = useMutation({
    mutationFn: () =>
      usersService.createProfessionalProfile({
        displayName: displayName.trim() || meQuery.data?.name || "Profissional",
        avatarUrl: avatarUrl.trim() || "https://i.pravatar.cc/150",
        professionalType,
        experienceYears: Math.max(0, experienceYears),
        bookingMode: BookingMode.DIRECT_BOOKING,
        whatsappNumber: whatsappNumber.replace(/\D/g, "") || undefined,
      }),
    onSuccess: () => {
      setError(null);
      setCreating(false);
      queryClient.invalidateQueries({ queryKey: ["my-professional-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["me", userId] });
    },
    onError: (err) => setError(formatApiError(err)),
  });

  if (!userId || meQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border border-border/50 bg-card p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Fonte única: GET professional-profile. NÃO misturar com cache de /me
  // de outra sessão (causava "você é profissional" após trocar de conta).
  const profile = profileQuery.isSuccess ? profileQuery.data : null;

  if (profile) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{t("hasProfileTitle")}</h3>
        </div>
        <p className="mb-1 text-sm text-foreground">{profile.displayName}</p>
        <p className="mb-4 text-xs text-muted-foreground">
          {profile.professionalType} · {profile.experienceYears}{" "}
          {t("years")}
        </p>
        <Link
          href={`/barbeiro/${meQuery.data?.id ?? "me"}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Scissors className="mr-2 h-4 w-4" />
          {t("goDashboard")}
        </Link>
      </div>
    );
  }

  if (!creating) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-2 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{t("becomeTitle")}</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{t("becomeDesc")}</p>
        <Button onClick={() => setCreating(true)}>{t("becomeBtn")}</Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-4 text-lg font-bold">{t("formTitle")}</h3>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-sm">{t("displayName")}</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={meQuery.data?.name}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("type")}</Label>
          <select
            value={professionalType}
            onChange={(e) =>
              setProfessionalType(e.target.value as ProfessionalType)
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
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
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("whatsapp")}</Label>
          <Input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="5511999999999"
            inputMode="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-sm">{t("avatarUrl")}</Label>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {t("create")}
        </Button>
        <Button variant="ghost" onClick={() => setCreating(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
