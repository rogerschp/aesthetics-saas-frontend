"use client";

import { UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfessionalProfileCard } from "@/features/professional/components/ProfessionalProfileCard";

/** Estado exibido em `/barbeiro/[id]` quando o usuário ainda não tem perfil profissional. */
export function ProfessionalNoProfileState() {
  const t = useTranslations("BarbeiroDashboard");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-28">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UserCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">{t("noProfileTitle")}</h1>
        <p className="text-muted-foreground">{t("noProfileDesc")}</p>
      </div>
      <ProfessionalProfileCard hideDashboardLink />
    </div>
  );
}
