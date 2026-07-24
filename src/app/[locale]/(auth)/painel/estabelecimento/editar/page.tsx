"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StoreProfileForm } from "@/components/forms/tenant/StoreProfileForm";
import { HoursInputRepeater } from "@/components/forms/tenant/HoursInputRepeater";
import { ServiceHierarchyBuilder } from "@/components/forms/tenant/ServiceHierarchyBuilder";
import { TenantServicesImages } from "@/components/forms/tenant/TenantServicesImages";
import { TeamManager } from "@/components/forms/tenant/TeamManager";
import { AparenciaEditor } from "@/components/forms/tenant/AparenciaEditor";
import { TenantDangerZone } from "@/components/forms/tenant/TenantDangerZone";
import { ReviewsWall } from "@/components/shared/estabelecimento/ReviewsWall";
import {
  EditarEstabelecimentoSidebar,
  type SecaoEdicao,
} from "@/components/shared/estabelecimento/EditarEstabelecimentoSidebar";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TenantTema } from "@/types";
import { TEMA_PADRAO } from "@/lib/mock/temas";
import { useTenantContext } from "@/components/providers/TenantProvider";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { catalogService } from "@/lib/api/services/catalog.service";
import { tenantProfessionalsService } from "@/lib/api/services/tenant-professionals.service";
import { themeService } from "@/lib/api/services/theme.service";
import { subscriptionService } from "@/lib/api/services/subscription.service";
import {
  availabilityService,
  defaultWeekHours,
  workingHoursToForm,
  type FormDayHours,
} from "@/lib/api/services/availability.service";
import { formatApiError } from "@/lib/api/errors";
import { canCustomizeTheme } from "@/lib/plans";
import { digitsOnly, maskCep, maskCnpj, maskPhoneBR, phoneToApiDigits } from "@/lib/masks";
import { geocodeAddress } from "@/lib/geocode";
import { cn } from "@/lib/utils";
import {
  Address,
  ProfessionalType,
  Service,
  Tenant,
  TenantProfessional,
  TenantProfessionalStatus,
  TenantSegment,
  TenantThemeData,
  TenantUserRole,
} from "@/lib/api/types";

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
  slug: z.string().min(3),
  telefone: z
    .string()
    .refine((v) => {
      const d = phoneToApiDigits(v);
      return d.length >= 12 && d.length <= 13;
    }, "Telefone inválido. Use DDD + número."),
  segment: z.nativeEnum(TenantSegment, {
    message: "Selecione o segmento",
  }),
  cnpj: z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || digitsOnly(v).length === 14,
      "CNPJ deve ter 14 dígitos",
    ),
  banner: z.string().optional(),
  bannerWide: z.string().optional(),
  cover: z.string().optional(),
  endereco: addressSchema,
  redesSociais: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }),
  horarios: z
    .array(z.object({ fechado: z.boolean(), inicio: z.string(), fim: z.string() }))
    .length(7),
  servicos: z.array(
    z.object({
      titulo: z.string().min(1, "Obrigatório"),
      itens: z.array(
        z.object({
          descricao: z.string().min(1, "Obrigatório"),
          preco: z.number().min(0),
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

const TYPE_LABEL: Record<ProfessionalType, string> = {
  [ProfessionalType.BARBER]: "Barbeiro",
  [ProfessionalType.TATTOO_ARTIST]: "Tatuador(a)",
  [ProfessionalType.HAIRDRESSER]: "Cabeleireiro(a)",
  [ProfessionalType.MANICURE]: "Manicure",
  [ProfessionalType.ESTHETICIAN]: "Esteticista",
  [ProfessionalType.LASH_DESIGNER]: "Lash Designer",
  [ProfessionalType.EYEBROW_DESIGNER]: "Designer de Sobrancelhas",
};

const EMPTY_ADDRESS: Address = {
  street: "",
  number: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brazil",
  complement: "",
};

function buildFormValues(
  tenant: Tenant,
  services: Service[],
  team: TenantProfessional[],
  horarios: FormDayHours[],
): TenantFormValues {
  const ativos = services.filter((s) => s.isActive);
  return {
    nome: tenant.name,
    slug: tenant.slug,
    telefone: maskPhoneBR(tenant.telephone ?? ""),
    segment: tenant.segment ?? ("" as unknown as TenantSegment),
    cnpj: tenant.cnpj ? maskCnpj(tenant.cnpj) : "",
    banner: tenant.avatarUrl ?? "",
    bannerWide: tenant.socialMedia?.banner ?? "",
    cover: tenant.socialMedia?.cover ?? "",
    endereco: {
      ...EMPTY_ADDRESS,
      ...(tenant.address ?? {}),
      country: tenant.address?.country || "Brazil",
      state: (tenant.address?.state || "").toUpperCase(),
      zipCode: tenant.address?.zipCode
        ? maskCep(tenant.address.zipCode)
        : "",
    },
    redesSociais: {
      instagram: tenant.socialMedia?.instagram ?? "",
      facebook: tenant.socialMedia?.facebook ?? "",
    },
    horarios,
    servicos:
      ativos.length > 0
        ? [
            {
              titulo: "Serviços",
              itens: ativos.map((s) => ({
                descricao: s.name,
                preco: Number(s.price),
              })),
            },
          ]
        : [],
    time: team.map((tp) => ({
      nome: tp.professionalProfile?.displayName ?? "Profissional",
      role: tp.professionalProfile
        ? TYPE_LABEL[tp.professionalProfile.professionalType] ?? "Profissional"
        : "Profissional",
      foto: tp.professionalProfile?.avatarUrl ?? "",
    })),
  };
}

export default function TenantEditPage() {
  const t = useTranslations("EstabelecimentoForm");
  const tAparencia = useTranslations("Aparencia");
  const { current, isLoading: tenantLoading, refetch: refetchTenants, role } =
    useTenantContext();
  const tenantId = current?.tenant.id;
  const canManageTenant =
    role === TenantUserRole.OWNER || role === TenantUserRole.ADMIN;
  const queryClient = useQueryClient();

  const [secaoAtiva, setSecaoAtiva] = useState<SecaoEdicao>("informacoes");
  const [tema, setTema] = useState<TenantTema>(TEMA_PADRAO);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tenantQuery = useQuery({
    queryKey: ["tenant-edit", tenantId],
    queryFn: () => tenantsService.getById(tenantId!),
    enabled: !!tenantId,
  });
  const servicesQuery = useQuery({
    queryKey: ["tenant-edit-services", tenantId],
    queryFn: () => catalogService.list(tenantId!),
    enabled: !!tenantId,
  });
  const teamQuery = useQuery({
    queryKey: ["tenant-edit-team", tenantId],
    queryFn: () => tenantProfessionalsService.list(tenantId!, false),
    enabled: !!tenantId,
  });

  const subQuery = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: () => subscriptionService.get(tenantId!),
    enabled: !!tenantId,
  });
  const canCustomize = canCustomizeTheme(subQuery.data?.plan.features);

  /** Expediente fica na agenda do 1º profissional ativo (em geral o owner). */
  const hoursTpId = useMemo(() => {
    const team = teamQuery.data ?? [];
    const active =
      team.find((tp) => tp.status === TenantProfessionalStatus.ACTIVE) ??
      team[0];
    return active?.id ?? null;
  }, [teamQuery.data]);

  const hoursQuery = useQuery({
    queryKey: ["tenant-edit-hours", tenantId, hoursTpId],
    queryFn: () => availabilityService.listWorkingHours(tenantId!, hoursTpId!),
    enabled: !!tenantId && !!hoursTpId,
    retry: false,
  });

  const themeQuery = useQuery({
    queryKey: ["tenant-edit-theme", tenantId],
    queryFn: () => themeService.get(tenantId!),
    enabled: !!tenantId && canCustomize,
    retry: false,
  });

  const methods = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      horarios: defaultWeekHours(),
      servicos: [],
      time: [],
      endereco: EMPTY_ADDRESS,
      redesSociais: {},
      cnpj: "",
      telefone: "",
      segment: "" as unknown as TenantSegment,
    },
  });

  const realData = useMemo(() => {
    if (!tenantQuery.data) return null;
    // Espera hours carregar quando há profissional; sem TP usa default.
    if (hoursTpId && hoursQuery.isLoading) return null;
    const horarios =
      hoursQuery.data != null
        ? workingHoursToForm(hoursQuery.data)
        : defaultWeekHours();
    return buildFormValues(
      tenantQuery.data,
      servicesQuery.data ?? [],
      teamQuery.data ?? [],
      horarios,
    );
  }, [
    tenantQuery.data,
    servicesQuery.data,
    teamQuery.data,
    hoursTpId,
    hoursQuery.isLoading,
    hoursQuery.data,
  ]);

  useEffect(() => {
    if (realData) methods.reset(realData);
  }, [realData, methods]);

  const [prevThemeKey, setPrevThemeKey] = useState<string | null>(null);
  const apiTheme = themeQuery.data?.theme;
  const themeKey = apiTheme ? JSON.stringify(apiTheme) : null;
  if (themeKey && themeKey !== prevThemeKey) {
    setPrevThemeKey(themeKey);
    setTema(apiTheme as unknown as TenantTema);
  }

  const loading =
    tenantLoading ||
    (!!tenantId &&
      (tenantQuery.isLoading ||
        servicesQuery.isLoading ||
        (!!hoursTpId && hoursQuery.isLoading)));

  const saveMutation = useMutation({
    mutationFn: async (data: TenantFormValues) => {
      if (!tenantId) throw new Error("no-tenant");

      const socialMedia: Record<string, string> = {};
      const ig = data.redesSociais.instagram?.trim();
      const fb = data.redesSociais.facebook?.trim();
      if (ig) socialMedia.instagram = ig;
      if (fb) socialMedia.facebook = fb;
      const bannerWide = data.bannerWide?.trim();
      const cover = data.cover?.trim();
      if (bannerWide) socialMedia.banner = bannerWide;
      if (cover) socialMedia.cover = cover;

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

      await tenantsService.update(tenantId, {
        name: data.nome.trim(),
        telephone: phoneToApiDigits(data.telefone),
        segment: data.segment,
        ...(cnpjDigits.length === 14 ? { cnpj: cnpjDigits } : {}),
        socialMedia,
        address,
        ...(geo
          ? { latitude: geo.latitude, longitude: geo.longitude }
          : {}),
      });

      // Persiste expediente na agenda do profissional.
      let tpId = hoursTpId;
      if (!tpId) {
        try {
          const bound = await tenantProfessionalsService.bindMe(tenantId);
          tpId = bound.id;
        } catch {
          // Sem profissional vinculado — segue sem expediente.
        }
      }
      if (tpId) {
        await availabilityService.syncWeekFromForm(
          tenantId,
          tpId,
          data.horarios,
        );
      }

      if (canCustomize && tema && secaoAtiva === "aparencia") {
        try {
          await themeService.upsert(tenantId, tema as unknown as TenantThemeData);
        } catch {
          // Plano pode bloquear tema — não falha o save do tenant.
        }
      }
    },
    onSuccess: () => {
      setSaveError(null);
      setSaveMsg(t("saveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["tenant-edit", tenantId] });
      queryClient.invalidateQueries({
        queryKey: ["tenant-edit-hours", tenantId],
      });
      refetchTenants();
      setTimeout(() => setSaveMsg(null), 2500);
    },
    onError: (err) => {
      setSaveMsg(null);
      setSaveError(formatApiError(err) || t("saveError"));
    },
  });

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
        return tenantId ? (
          <TeamManager tenantId={tenantId} canManage={canManageTenant} />
        ) : null;
      case "avaliacoes":
        return tenantId ? (
          <ReviewsWall tenantId={tenantId} />
        ) : null;
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

        {!tenantId && !tenantLoading ? (
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
                saveMutation.mutate(data),
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
                    disabled={saveMutation.isPending}
                    className="px-8 font-bold"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : saveMsg ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {saveMsg
                      ? t("saveSuccess")
                      : saveMutation.isPending
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
