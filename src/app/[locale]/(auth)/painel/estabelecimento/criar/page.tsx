"use client";

import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreProfileForm } from "@/components/forms/tenant/StoreProfileForm";
import { HoursInputRepeater } from "@/components/forms/tenant/HoursInputRepeater";
import { ServiceHierarchyBuilder } from "@/components/forms/tenant/ServiceHierarchyBuilder";
import { TeamSetupHint } from "@/components/forms/tenant/TeamManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Building2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { catalogService } from "@/lib/api/services/catalog.service";
import { usersService } from "@/lib/api/services/users.service";
import { tenantProfessionalsService } from "@/lib/api/services/tenant-professionals.service";
import { availabilityService } from "@/lib/api/services/availability.service";
import { Address, ProfessionalType } from "@/lib/api/types";
import { formatApiError } from "@/lib/api/errors";
import {
  digitsOnly,
  phoneToApiDigits,
} from "@/lib/masks";
import { geocodeAddress } from "@/lib/geocode";
import { TENANT_STORAGE_KEY } from "@/components/providers/TenantProvider";

const addressSchema = z.object({
  street: z.string().min(1, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  state: z
    .string()
    .length(2, "UF com 2 letras")
    .transform((s) => s.toUpperCase()),
  zipCode: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP no formato 00000-000"),
  country: z.string().min(1, "País obrigatório"),
  complement: z.string().optional(),
});

const tenantSchema = z.object({
  nome: z.string().min(3, "Nome muito curto"),
  slug: z
    .string()
    .min(3, "Slug muito curto")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens"),
  telefone: z
    .string()
    .refine((v) => {
      const d = phoneToApiDigits(v);
      return d.length >= 12 && d.length <= 13;
    }, "Telefone inválido. Use DDD + número."),
  cnpj: z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || digitsOnly(v).length === 14,
      "CNPJ deve ter 14 dígitos",
    ),
  banner: z.string().optional(),
  endereco: addressSchema,
  redesSociais: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }),
  horarios: z
    .array(
      z.object({
        fechado: z.boolean(),
        inicio: z.string(),
        fim: z.string(),
      }),
    )
    .length(7),
  servicos: z.array(
    z.object({
      titulo: z.string().min(1, "Obrigatório"),
      itens: z.array(
        z.object({
          descricao: z.string().min(1, "Obrigatório"),
          preco: z.number().min(0, "Deve ser maior ou igual a 0"),
        }),
      ),
    }),
  ),
  time: z.array(
    z.object({
      nome: z.string(),
      role: z.string(),
      foto: z.string().optional(),
    }),
  ),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const EMPTY_ADDRESS: Address = {
  street: "",
  number: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brazil",
  complement: "",
};

const defaultValues: TenantFormValues = {
  nome: "",
  slug: "",
  telefone: "",
  cnpj: "",
  banner: "",
  endereco: EMPTY_ADDRESS,
  redesSociais: { instagram: "", facebook: "" },
  horarios: Array.from({ length: 7 }, () => ({
    fechado: false,
    inicio: "09:00",
    fim: "18:00",
  })),
  servicos: [],
  time: [],
};

function firstInvalidTab(errors: FieldErrors<TenantFormValues>): string {
  if (
    errors.nome ||
    errors.slug ||
    errors.telefone ||
    errors.cnpj ||
    errors.banner ||
    errors.endereco ||
    errors.redesSociais
  ) {
    return "perfil";
  }
  if (errors.horarios) return "expediente";
  if (errors.servicos) return "servicos";
  if (errors.time) return "equipe";
  return "perfil";
}

function flattenErrors(
  errors: FieldErrors<TenantFormValues>,
  prefix = "",
): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      typeof value === "object" &&
      "message" in value &&
      typeof value.message === "string"
    ) {
      out.push(value.message);
    } else if (typeof value === "object") {
      out.push(...flattenErrors(value as FieldErrors<TenantFormValues>, path));
    }
  }
  return out;
}

export default function TenantCreatePage() {
  const t = useTranslations("EstabelecimentoForm");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [formError, setFormError] = useState<string | null>(null);

  const methods = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const socialMedia: Record<string, string> = {};
      const ig = data.redesSociais.instagram?.trim();
      const fb = data.redesSociais.facebook?.trim();
      if (ig) socialMedia.instagram = ig;
      if (fb) socialMedia.facebook = fb;

      const address: Address = {
        street: data.endereco.street.trim(),
        number: data.endereco.number.trim(),
        city: data.endereco.city.trim(),
        state: data.endereco.state.trim().toUpperCase(),
        zipCode: data.endereco.zipCode.trim(),
        country: data.endereco.country.trim(),
        ...(data.endereco.complement?.trim()
          ? { complement: data.endereco.complement.trim() }
          : {}),
      };

      const geo = await geocodeAddress(address);
      const cnpjDigits = digitsOnly(data.cnpj ?? "");

      const tenant = await tenantsService.createWithOwner({
        name: data.nome.trim(),
        slug: data.slug.trim(),
        telephone: phoneToApiDigits(data.telefone),
        ...(cnpjDigits.length === 14 ? { cnpj: cnpjDigits } : {}),
        ...(Object.keys(socialMedia).length > 0 ? { socialMedia } : {}),
        address,
      });

      // coords via PATCH; segment/description só no update (editar).
      if (geo) {
        try {
          await tenantsService.update(tenant.id, {
            latitude: geo.latitude,
            longitude: geo.longitude,
          });
        } catch {
          // Tenant já criado — não bloqueia o fluxo.
        }
      }

      const createdServicesIds: string[] = [];
      for (const cat of data.servicos) {
        for (const item of cat.itens) {
          const service = await catalogService.create(tenant.id, {
            name: `${cat.titulo} - ${item.descricao}`,
            description: cat.titulo,
            price: item.preco,
            durationInMinutes: 30,
          });
          createdServicesIds.push(service.id);
        }
      }

      try {
        await usersService.createProfessionalProfile({
          displayName: `${data.nome.trim()} Admin`,
          professionalType: ProfessionalType.BARBER,
          experienceYears: 1,
        });
      } catch {
        // Perfil já existe — segue.
      }

      const tp = await tenantProfessionalsService.bindMe(tenant.id);

      if (createdServicesIds.length > 0) {
        await tenantProfessionalsService.addOfferedServices(
          tenant.id,
          tp.id,
          createdServicesIds,
        );
      }

      const daysMap = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const closedDays = data.horarios
        .map((h, i) => (h.fechado ? daysMap[i] : null))
        .filter(Boolean) as string[];
      const firstOpen = data.horarios.find((h) => !h.fechado);
      const periods = firstOpen
        ? [{ startTime: firstOpen.inicio, endTime: firstOpen.fim }]
        : [{ startTime: "09:00", endTime: "18:00" }];

      await availabilityService.bootstrapWeek(tenant.id, tp.id, {
        closedDays,
        periods,
        overwriteExisting: true,
      });

      localStorage.setItem(TENANT_STORAGE_KEY, tenant.id);
      await queryClient.invalidateQueries({ queryKey: ["me-tenants"] });
      router.push("/painel");
    } catch (error: unknown) {
      console.error("Erro na orquestração do Tenant", error);
      setFormError(
        formatApiError(error) ||
          "Ocorreu um erro ao criar o estabelecimento. Verifique se o slug já está em uso.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: FieldErrors<TenantFormValues>) => {
    const tab = firstInvalidTab(errors);
    setActiveTab(tab);
    const messages = flattenErrors(errors);
    setFormError(
      messages[0]
        ? `Preencha os campos obrigatórios: ${messages.slice(0, 3).join(" · ")}`
        : "Preencha os campos obrigatórios antes de concluir.",
    );
  };

  const handleNextTab = (next: string) => {
    setActiveTab(next);
  };

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
                  <TeamSetupHint />
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
