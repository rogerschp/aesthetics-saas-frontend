"use client";

import { Link } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { ArrowRight, Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/shared/ui/button";
import { useMe } from "@/features/professional/hooks/useMe";
import { useMyProfessionalProfile } from "@/features/professional/hooks/useMyProfessionalProfile";
import { cn } from "@/shared/lib/utils";
import { ProfessionalProfileCard } from "@/features/professional/components/ProfessionalProfileCard";

/**
 * No perfil de cliente: atalho leve para Minha Agenda,
 * ou o fluxo de "torne-se profissional" se ainda não tiver perfil.
 */
export function ProfessionalProfileShortcut() {
  const t = useTranslations("PerfilPro");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const meQuery = useMe();
  const profileQuery = useMyProfessionalProfile();

  if (!userId || meQuery.isLoading || profileQuery.isLoading) {
    return null;
  }

  const profile = profileQuery.data;
  const meId = meQuery.data?.id ?? userId;

  if (profile) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Scissors className="h-4 w-4 text-primary" />
            {t("hasProfileTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.displayName}
            {profile.isActive ? "" : ` · ${t("inactiveBadge")}`}
          </p>
        </div>
        <Link
          href={`/barbeiro/${meId}`}
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
        >
          {t("goDashboard")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Sem perfil: mantém o card de criação (formulário completo).
  return <ProfessionalProfileCard />;
}
