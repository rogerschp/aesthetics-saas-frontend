"use client";

import { Loader2 } from "lucide-react";
import { useTenantContext } from "@/components/providers/TenantProvider";
import { ReportsPanel } from "@/components/reports/ReportsPanel";
import { TenantUserRole } from "@/lib/api/types";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALLOWED: TenantUserRole[] = [
  TenantUserRole.OWNER,
  TenantUserRole.ADMIN,
  TenantUserRole.STAFF,
];

export default function RelatoriosPage() {
  const t = useTranslations("Reports");
  const { current, role, isLoading } = useTenantContext();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!current || !role || !ALLOWED.includes(role)) {
    return (
      <main className="container mx-auto max-w-lg px-4 pb-24 pt-32 text-center">
        <h1 className="mb-2 text-xl font-bold">{t("forbiddenTitle")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("forbiddenDesc")}</p>
        <Link href="/painel" className={cn(buttonVariants())}>
          {t("back")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 pt-24">
      <div className="container mx-auto max-w-6xl px-4">
        <ReportsPanel tenantId={current.tenant.id} />
      </div>
    </main>
  );
}
