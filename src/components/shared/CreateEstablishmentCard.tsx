"use client";

import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { useTenantContext } from "@/components/providers/TenantProvider";
import { cn } from "@/lib/utils";

export function CreateEstablishmentCard() {
  const t = useTranslations("PainelHome");
  const { memberships, isLoading } = useTenantContext();

  if (isLoading || memberships.length > 0) return null;

  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Store className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">{t("noTenantTitle")}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{t("noTenantDesc")}</p>
      <Link
        href="/painel/estabelecimento/criar"
        className={cn(buttonVariants({ size: "lg" }))}
      >
        <Plus className="mr-2 h-5 w-5" />
        {t("createTenant")}
      </Link>
    </div>
  );
}
