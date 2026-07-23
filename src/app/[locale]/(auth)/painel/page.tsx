"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Store,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTenantContext } from "@/components/providers/TenantProvider";
import { TenantSwitcher } from "@/components/shared/TenantSwitcher";
import { SubscriptionCard } from "@/components/shared/SubscriptionCard";
import { OpsBookingPanel } from "@/components/booking/OpsBookingPanel";
import { CancellationSettingsForm } from "@/components/forms/tenant/CancellationSettingsForm";
import { PanelPageSkeleton } from "@/components/shared/PanelPageSkeleton";
import { TenantUserRole } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function PainelLoading() {
  const t = useTranslations("PainelHome");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 2500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div>
      <PanelPageSkeleton />
      {slow ? (
        <p className="mx-auto max-w-sm px-4 pb-10 text-center text-sm text-muted-foreground">
          {t("slowLoadHint")}
        </p>
      ) : null}
    </div>
  );
}

export default function PainelPage() {
  const t = useTranslations("PainelHome");
  const { memberships, current, role, isLoading, isError, refetch } =
    useTenantContext();

  if (isLoading) {
    return <PainelLoading />;
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="mb-2 text-2xl font-bold">{t("loadErrorTitle")}</h1>
        <p className="mb-6 text-muted-foreground">{t("loadErrorDesc")}</p>
        <Button type="button" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-32 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">{t("noTenantTitle")}</h1>
        <p className="mb-6 text-muted-foreground">{t("noTenantDesc")}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/painel/estabelecimento/criar"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <Plus className="mr-2 h-5 w-5" />
            {t("createTenant")}
          </Link>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  // Memberships chegaram, mas o tenant atual ainda está sendo resolvido.
  if (!current) {
    return <PainelLoading />;
  }

  const isOwnerOrAdmin =
    role === TenantUserRole.OWNER || role === TenantUserRole.ADMIN;

  return (
    <main className="min-h-screen pb-24 pt-24">
      <div className="container mx-auto max-w-6xl space-y-8 px-4">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TenantSwitcher />
          <div className="flex gap-3">
            <Link
              href="/painel/estabelecimento/editar"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("editStore")}
            </Link>
            <Link
              href="/painel/estabelecimento/criar"
              className={cn(buttonVariants())}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("new")}
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubscriptionCard tenantId={current.tenant.id} />

          {isOwnerOrAdmin && (
            <CancellationSettingsForm
              tenantId={current.tenant.id}
              initialEnabled={current.tenant.clientCanCancelConfirmed}
              initialLeadMinutes={
                current.tenant.clientCancelConfirmedMinLeadMinutes
              }
              onSaved={refetch}
            />
          )}
        </div>

        {(isOwnerOrAdmin || role === TenantUserRole.STAFF) && (
          <div className="flex justify-end">
            <Link
              href="/painel/relatorios"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {t("reports")}
            </Link>
          </div>
        )}

        <OpsBookingPanel tenantId={current.tenant.id} />
      </div>
    </main>
  );
}
