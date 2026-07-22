import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { HomeTenantSearch } from "@/components/shared/HomeTenantSearch";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />

        <section className="container mx-auto max-w-screen-2xl px-4 py-16">
          <Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <HomeTenantSearch />
          </Suspense>
        </section>
      </main>

      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>{t("footer", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
