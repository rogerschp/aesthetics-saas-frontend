import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProfileHeader } from "@/components/shared/ProfileHeader";
import { ProfileBookings } from "@/components/shared/ProfileBookings";
import { ProfileEditForm } from "@/components/shared/ProfileEditForm";
import { ProfessionalProfileShortcut } from "@/components/shared/ProfessionalProfileShortcut";
import { CreateEstablishmentCard } from "@/components/shared/CreateEstablishmentCard";
import { DeactivateAccountCard } from "@/components/shared/DeactivateAccountCard";

export const metadata = {
  title: "Meu Perfil | Cyacsys",
  description: "Conta e agendamentos como cliente.",
};

export default async function PerfilPage() {
  const t = await getTranslations("Perfil");

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 pt-28">
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backHome")}
          </Link>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <ProfileHeader />
            </div>
            <ProfileEditForm />
          </div>

          <ProfileBookings />

          <div className="space-y-4 border-t border-border/40 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("moreOptions")}
            </h2>
            <ProfessionalProfileShortcut />
            <CreateEstablishmentCard />
            <DeactivateAccountCard />
          </div>
        </div>
      </div>
    </div>
  );
}
