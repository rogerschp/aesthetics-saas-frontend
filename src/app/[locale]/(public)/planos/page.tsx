import { getTranslations } from "next-intl/server";
import { PlansCatalog } from "@/components/shared/PlansCatalog";

export default async function PlanosPage() {
  const t = await getTranslations("Planos");

  return (
    <main className="min-h-screen bg-background pb-24 pt-24">
      <section className="container mx-auto max-w-5xl space-y-6 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
          {t("heroTitle1")}{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-yellow-200 bg-clip-text text-transparent">
            {t("heroTitle2")}
          </span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
          {t("heroSubtitle")}
        </p>
      </section>

      <section className="container mx-auto mt-16 max-w-7xl px-4">
        <PlansCatalog />
      </section>
    </main>
  );
}
