import { Suspense } from "react";
import { HomeTenantSearch } from "@/components/shared/HomeTenantSearch";
import { HomePageSkeleton } from "@/components/shared/HomePageSkeleton";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Suspense fallback={<HomePageSkeleton />}>
          <HomeTenantSearch />
        </Suspense>
      </main>

      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>{t("footer", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
