"use client";

import type { ReactNode } from "react";
import { FormProvider } from "react-hook-form";
import { StoreProfileForm } from "@/features/tenant/components/StoreProfileForm";
import { HoursInputRepeater } from "@/features/tenant/components/HoursInputRepeater";
import { ServiceHierarchyBuilder } from "@/features/tenant/components/ServiceHierarchyBuilder";
import { TenantServicesImages } from "@/features/tenant/components/TenantServicesImages";
import { AparenciaEditor } from "@/features/tenant/components/AparenciaEditor";
import { TenantDangerZone } from "@/features/tenant/components/TenantDangerZone";
import { EditarEstabelecimentoSidebar } from "@/features/tenant/components/estabelecimento/EditarEstabelecimentoSidebar";
import { Button, buttonVariants } from "@/shared/ui/button";
import {
  ArrowLeft,
  Building2,
  Paintbrush,
  AlertTriangle,
  Loader2,
  Save,
  Check,
  Palette,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { useTenantEditForm } from "@/features/tenant/hooks/useTenantEditForm";

export interface TenantEditPageProps {
  /** Slot da aba "equipe" — a página injeta o `TeamManager` (feature `team`). */
  renderTeamSection?: (tenantId: string, canManageTenant: boolean) => ReactNode;
  /** Slot da aba "avaliações" — a página injeta o `ReviewsWall` (feature `reviews`). */
  renderReviewsSection?: (tenantId: string) => ReactNode;
}

export function TenantEditPage({
  renderTeamSection,
  renderReviewsSection,
}: TenantEditPageProps = {}) {
  const t = useTranslations("EstabelecimentoForm");
  const tAparencia = useTranslations("Aparencia");

  const {
    methods,
    tenantId,
    tenantQuery,
    loading,
    canManageTenant,
    canCustomize,
    secaoAtiva,
    setSecaoAtiva,
    tema,
    setTema,
    saveMsg,
    saveError,
    isSaving,
    submitTenantEdit,
    refetchTenants,
  } = useTenantEditForm();

  const renderizarConteudo = () => {
    switch (secaoAtiva) {
      case "informacoes":
        return <StoreProfileForm tenantId={tenantId} showSegment />;
      case "expediente":
        return <HoursInputRepeater />;
      case "servicos":
        return (
          <div className="space-y-10">
            <ServiceHierarchyBuilder />
            {tenantId && <TenantServicesImages tenantId={tenantId} />}
          </div>
        );
      case "equipe":
        return tenantId
          ? (renderTeamSection?.(tenantId, canManageTenant) ?? null)
          : null;
      case "avaliacoes":
        return tenantId ? (renderReviewsSection?.(tenantId) ?? null) : null;
      case "aparencia":
        if (!canCustomize) {
          return (
            <div className="mx-auto max-w-md py-10 text-center">
              <Palette className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
              <h3 className="mb-2 text-xl font-bold text-white">
                {tAparencia("lockedTitle")}
              </h3>
              <p className="mb-6 text-sm text-zinc-400">
                {tAparencia("lockedDesc")}
              </p>
              <Link href="/planos" className={cn(buttonVariants())}>
                <Sparkles className="mr-2 h-4 w-4" />
                {tAparencia("lockedCta")}
              </Link>
            </div>
          );
        }
        return <AparenciaEditor tema={tema} onTemaChange={setTema} />;
      case "desativar":
        if (!canManageTenant || !tenantQuery.data || !tenantId) {
          return null;
        }
        return (
          <TenantDangerZone
            tenantId={tenantId}
            tenantSlug={tenantQuery.data.slug}
            tenantName={tenantQuery.data.name}
            status={tenantQuery.data.status}
            onStatusChange={() => {
              void tenantQuery.refetch();
              void refetchTenants();
            }}
          />
        );
      default:
        return <StoreProfileForm tenantId={tenantId} showSegment />;
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full -translate-x-1/2 bg-gradient-to-b from-blue-500/5 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 pt-28">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/painel"
            className="group inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-yellow-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("back")}
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-500" />
            <span className="font-medium tracking-wide text-zinc-500">
              {t("managerPanel")}
            </span>
          </div>
        </div>

        {!tenantId && !loading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
            {t("noTenantSelected")}
          </div>
        ) : loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              className="space-y-8"
              onSubmit={methods.handleSubmit((data) =>
                submitTenantEdit(data),
              )}
            >
              <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
                    <Paintbrush className="h-8 w-8 text-yellow-500" />
                    {t("editTitle")}
                  </h1>
                  <p className="mt-2 text-lg text-zinc-400">
                    {t("editSubtitle")}
                  </p>
                </div>

                {secaoAtiva !== "desativar" && secaoAtiva !== "equipe" && (
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 font-bold"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : saveMsg ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {saveMsg
                      ? t("saveSuccess")
                      : isSaving
                        ? t("saving")
                        : t("saveChanges")}
                  </Button>
                )}
              </div>

              {(saveError || saveMsg) && (
                <div
                  className={
                    saveError
                      ? "rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                      : "rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
                  }
                >
                  {saveError ?? saveMsg}
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{t("readOnlyNotice")}</p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                <EditarEstabelecimentoSidebar
                  secaoAtiva={secaoAtiva}
                  onMudarSecao={setSecaoAtiva}
                  canCustomize={canCustomize}
                  canManageTenant={canManageTenant}
                />

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "relative rounded-3xl border p-6 shadow-2xl backdrop-blur-sm sm:p-10",
                      secaoAtiva === "desativar"
                        ? "border-transparent bg-transparent p-0 shadow-none sm:p-0"
                        : "border-zinc-800/60 bg-zinc-950/50",
                    )}
                  >
                    {renderizarConteudo()}
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}
