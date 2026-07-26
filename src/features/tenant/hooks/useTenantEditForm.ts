"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useTenantContext } from "@/shared/providers/TenantProvider";
import {
  useTenantEdit,
  useTenantEditTeam,
  useTenantEditHours,
  useTenantEditTheme,
  useTenantSubscription,
  useSaveTenantEdit,
  type SaveTenantEditInput,
} from "@/features/tenant/hooks/useTenantEdit";
import { useTenantServices } from "@/features/tenant/hooks/useTenantServices";
import {
  defaultWeekHours,
  workingHoursToForm,
  type FormDayHours,
} from "@/features/tenant/api/working-hours.service";
import { formatApiError } from "@/shared/lib/api/errors";
import { canCustomizeTheme } from "@/shared/lib/plans";
import { digitsOnly, maskCep, maskCnpj, maskPhoneBR, phoneToApiDigits } from "@/shared/lib/masks";
import {
  Address,
  ProfessionalType,
  Service,
  TenantProfessional,
  TenantProfessionalStatus,
  TenantSegment,
  TenantUserRole,
} from "@/shared/lib/api/types";
import { Tenant } from "@/features/tenant/model/tenant.types";
import { TenantThemeData } from "@/features/tenant/model/theme.types";
import type { TenantTema } from "@/shared/types";
import { TEMA_PADRAO } from "@/shared/lib/mock/temas";
import type { SecaoEdicao } from "@/features/tenant/components/estabelecimento/EditarEstabelecimentoSidebar";

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

const tenantEditSchema = z.object({
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

export type TenantEditFormValues = z.infer<typeof tenantEditSchema>;

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
): TenantEditFormValues {
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

export interface UseTenantEditFormResult {
  methods: UseFormReturn<TenantEditFormValues>;
  tenantId?: string;
  tenantQuery: ReturnType<typeof useTenantEdit>;
  loading: boolean;
  canManageTenant: boolean;
  canCustomize: boolean;
  secaoAtiva: SecaoEdicao;
  setSecaoAtiva: (secao: SecaoEdicao) => void;
  tema: TenantTema;
  setTema: (tema: TenantTema) => void;
  saveMsg: string | null;
  saveError: string | null;
  isSaving: boolean;
  submitTenantEdit: (data: TenantEditFormValues) => void;
  refetchTenants: () => void;
}

/** Orquestra todo o form da tela de edição do estabelecimento (`/painel/estabelecimento/editar`). */
export function useTenantEditForm(): UseTenantEditFormResult {
  const t = useTranslations("EstabelecimentoForm");
  const { current, isLoading: tenantLoading, refetch: refetchTenants, role } =
    useTenantContext();
  const tenantId = current?.tenant.id;
  const canManageTenant =
    role === TenantUserRole.OWNER || role === TenantUserRole.ADMIN;

  const [secaoAtiva, setSecaoAtiva] = useState<SecaoEdicao>("informacoes");
  const [tema, setTema] = useState<TenantTema>(TEMA_PADRAO);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tenantQuery = useTenantEdit(tenantId);
  const servicesQuery = useTenantServices(tenantId);
  const teamQuery = useTenantEditTeam(tenantId);

  const subQuery = useTenantSubscription(tenantId);
  const canCustomize = canCustomizeTheme(subQuery.data?.plan.features);

  /** Expediente fica na agenda do 1º profissional ativo (em geral o owner). */
  const hoursTpId = useMemo(() => {
    const team = teamQuery.data ?? [];
    const active =
      team.find((tp) => tp.status === TenantProfessionalStatus.ACTIVE) ??
      team[0];
    return active?.id ?? null;
  }, [teamQuery.data]);

  const hoursQuery = useTenantEditHours(tenantId, hoursTpId);

  const themeQuery = useTenantEditTheme(tenantId, canCustomize);

  const methods = useForm<TenantEditFormValues>({
    resolver: zodResolver(tenantEditSchema),
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

  const saveMutation = useSaveTenantEdit(tenantId, {
    onSuccess: () => {
      setSaveError(null);
      setSaveMsg(t("saveSuccess"));
      refetchTenants();
      setTimeout(() => setSaveMsg(null), 2500);
    },
    onError: (err) => {
      setSaveMsg(null);
      setSaveError(formatApiError(err) || t("saveError"));
    },
  });

  function submitTenantEdit(data: TenantEditFormValues) {
    const payload: SaveTenantEditInput = {
      nome: data.nome,
      telefone: data.telefone,
      segment: data.segment,
      cnpj: data.cnpj,
      redesSociais: data.redesSociais,
      bannerWide: data.bannerWide,
      cover: data.cover,
      endereco: data.endereco,
      horarios: data.horarios,
      hoursTpId,
      canCustomize,
      tema: tema as unknown as TenantThemeData,
      shouldSaveTheme: secaoAtiva === "aparencia",
    };
    saveMutation.mutate(payload);
  }

  return {
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
    isSaving: saveMutation.isPending,
    submitTenantEdit,
    refetchTenants,
  };
}
