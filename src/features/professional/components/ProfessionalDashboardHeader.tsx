"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ProfessionalType } from "@/shared/lib/api/types";
import type { ProfessionalProfile } from "@/shared/lib/api/types";

const TYPE_LABEL: Record<ProfessionalType, string> = {
  [ProfessionalType.BARBER]: "Barbeiro",
  [ProfessionalType.TATTOO_ARTIST]: "Tatuador(a)",
  [ProfessionalType.HAIRDRESSER]: "Cabeleireiro(a)",
  [ProfessionalType.MANICURE]: "Manicure",
  [ProfessionalType.ESTHETICIAN]: "Esteticista",
  [ProfessionalType.LASH_DESIGNER]: "Lash Designer",
  [ProfessionalType.EYEBROW_DESIGNER]: "Designer de Sobrancelhas",
};

interface ProfessionalDashboardHeaderProps {
  profile: ProfessionalProfile;
}

export function ProfessionalDashboardHeader({
  profile,
}: ProfessionalDashboardHeaderProps) {
  const t = useTranslations("BarbeiroDashboard");

  return (
    <section className="mb-10 flex items-center gap-4">
      <Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/50">
        {profile.avatarUrl && (
          <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
        )}
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
  );
}
