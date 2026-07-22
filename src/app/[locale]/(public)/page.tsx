import { HeroSection } from "@/components/shared/HeroSection";
import { FeaturedCarousel } from "@/components/shared/FeaturedCarousel";
import { getEstabelecimentos } from "@/lib/mock/estabelecimentos";
import { getTranslations } from "next-intl/server";

const MAX_DESTAQUES = 8;

export default async function Home() {
  const t = await getTranslations("Home");
  const todos = await getEstabelecimentos();
  const destaques = todos.slice(0, MAX_DESTAQUES);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />

        <section className="container mx-auto px-4 py-16 max-w-screen-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("highlights")}
            </h2>
          </div>

          <div className="relative px-12 xl:px-14">
            <FeaturedCarousel estabelecimentos={destaques} />
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-border/40 py-8 text-center text-muted-foreground text-sm">
        <p>{t("footer", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
