import { getTranslations } from "next-intl/server";
import { ProfessionalPublicProfile } from "@/components/shared/ProfessionalPublicProfile";

export const metadata = {
  title: "Profissional | Cyacsys",
  description: "Perfil e avaliações do profissional.",
};

export default async function ProfissionalPublicPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const t = await getTranslations("ProfessionalReviews");

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full -translate-x-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="container relative z-10 mx-auto max-w-3xl px-4 pt-28">
        <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
          {t("pageTitle")}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">{t("pageSubtitle")}</p>
        <ProfessionalPublicProfile userId={userId} />
      </div>
    </div>
  );
}
