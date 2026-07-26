"use client";

import type { ReactNode } from "react";
import { FormProvider } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { StoreProfileForm } from "@/features/tenant/components/StoreProfileForm";
import { HoursInputRepeater } from "@/features/tenant/components/HoursInputRepeater";
import { ServiceHierarchyBuilder } from "@/features/tenant/components/ServiceHierarchyBuilder";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, Save, Building2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTenantCreateForm } from "@/features/tenant/hooks/useTenantCreateForm";

export interface TenantCreatePageProps {
  /** Slot da aba "equipe" — a página injeta o `TeamSetupHint` (feature `team`). */
  teamSetupHint?: ReactNode;
}

export function TenantCreatePage({ teamSetupHint }: TenantCreatePageProps = {}) {
  const t = useTranslations("EstabelecimentoForm");

  const {
    methods,
    isLoading,
    activeTab,
    setActiveTab,
    formError,
    onSubmit,
    onInvalid,
    handleNextTab,
  } = useTenantCreateForm();

  return (
    <div className="min-h-screen bg-black pb-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10 pt-28">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/painel"
            className="group inline-flex items-center text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            {t("back")}
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-500" />
            <span className="text-zinc-500 font-medium">Novo Estabelecimento</span>
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {t("createTitle")}
                </h1>
                <p className="text-zinc-400 mt-2 text-lg">{t("createSubtitle")}</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold px-8"
              >
                {isLoading ? (
                  t("saving")
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("createAccount")}
                  </>
                )}
              </Button>
            </div>

            {formError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="mb-6 border-b border-zinc-800/80">
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-x-6 gap-y-2 rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="perfil"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-base font-medium text-zinc-400 shadow-none after:hidden data-active:border-yellow-500 data-active:bg-transparent data-active:text-yellow-500 data-active:shadow-none"
                  >
                    {t("step1")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="expediente"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-base font-medium text-zinc-400 shadow-none after:hidden data-active:border-yellow-500 data-active:bg-transparent data-active:text-yellow-500 data-active:shadow-none"
                  >
                    {t("step2")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="servicos"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-base font-medium text-zinc-400 shadow-none after:hidden data-active:border-yellow-500 data-active:bg-transparent data-active:text-yellow-500 data-active:shadow-none"
                  >
                    {t("step3")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="equipe"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-base font-medium text-zinc-400 shadow-none after:hidden data-active:border-yellow-500 data-active:bg-transparent data-active:text-yellow-500 data-active:shadow-none"
                  >
                    {t("step4")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative">
                <TabsContent
                  value="perfil"
                  className="m-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <StoreProfileForm slugLocked={false} />
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => handleNextTab("expediente")}
                      variant="secondary"
                      className="bg-zinc-800 text-white hover:bg-zinc-700"
                    >
                      {t("nextStep")}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent
                  value="expediente"
                  className="m-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <HoursInputRepeater />
                  <div className="mt-8 flex justify-between">
                    <Button
                      type="button"
                      onClick={() => handleNextTab("perfil")}
                      variant="ghost"
                      className="text-zinc-400 hover:text-white"
                    >
                      ← {t("back")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNextTab("servicos")}
                      variant="secondary"
                      className="bg-zinc-800 text-white hover:bg-zinc-700"
                    >
                      {t("nextStep")}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent
                  value="servicos"
                  className="m-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <ServiceHierarchyBuilder />
                  <div className="mt-8 flex justify-between">
                    <Button
                      type="button"
                      onClick={() => handleNextTab("expediente")}
                      variant="ghost"
                      className="text-zinc-400 hover:text-white"
                    >
                      ← {t("back")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNextTab("equipe")}
                      variant="secondary"
                      className="bg-zinc-800 text-white hover:bg-zinc-700"
                    >
                      {t("nextStep")}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent
                  value="equipe"
                  className="m-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  {teamSetupHint}
                  <div className="mt-8 flex justify-start">
                    <Button
                      type="button"
                      onClick={() => handleNextTab("servicos")}
                      variant="ghost"
                      className="text-zinc-400 hover:text-white"
                    >
                      ← {t("back")}
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
