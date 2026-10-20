"use client";

import {
  useForm,
  type FieldErrors,
  type UseFormReturn,
} from "react-hook-form";
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
  useSaveTenantInfo,
  useSaveWorkingHours,
  useSaveTenantTheme,
  useSaveTenantServices,
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
  /** Aba cujo save está em andamento (ou null). */
  savingSection: SecaoEdicao | null;
  /** Última aba salva com sucesso (feedback no botão). */
  savedSection: SecaoEdicao | null;
  saveInfo: () => Promise<void>;
  saveHours: () => Promise<void>;
  saveServices: () => Promise<void>;
  saveTheme: () => Promise<void>;
  handleInvalid: (errors: FieldErrors<TenantEditFormValues>) => void;
  refetchTenants: () => void;
}

/** Extrai a primeira mensagem de erro (folha) da árvore de erros do RHF. */
function firstErrorMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;
  const record = errors as Record<string, unknown>;
  if (typeof record.message === "string" && record.message) {
    return record.message;
  }
  for (const value of Object.values(record)) {
    const found = firstErrorMessage(value);
    if (found) return found;
  }
  return null;
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
  const [temaOverride, setTema] = useState<TenantTema | null>(null);
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

  // Tema exibido: edição local do usuário > tema da API > padrão.
  // (Estado derivado — sem sincronizar via effect/render.)
  const tema =
    temaOverride ??
    (themeQuery.data?.theme as unknown as TenantTema | undefined) ??
    TEMA_PADRAO;

  const loading =
    tenantLoading ||
    (!!tenantId &&
      (tenantQuery.isLoading ||
        servicesQuery.isLoading ||
        (!!hoursTpId && hoursQuery.isLoading)));

  const [savedSection, setSavedSection] = useState<SecaoEdicao | null>(null);

  function onSaveSuccess(section: SecaoEdicao) {
    setSaveError(null);
    setSaveMsg(t("saveSuccess"));
    setSavedSection(section);
    refetchTenants();
    setTimeout(() => {
      setSaveMsg(null);
      setSavedSection(null);
    }, 2500);
  }

  function onSaveError(err: unknown) {
    setSaveMsg(null);
    setSavedSection(null);
    setSaveError(formatApiError(err) || t("saveError"));
  }

  const infoMutation = useSaveTenantInfo(tenantId, {
    onSuccess: () => onSaveSuccess("informacoes"),
    onError: onSaveError,
  });
  const hoursMutation = useSaveWorkingHours(tenantId, {
    onSuccess: () => onSaveSuccess("expediente"),
    onError: onSaveError,
  });
  const servicesMutation = useSaveTenantServices(tenantId, {
    onSuccess: () => onSaveSuccess("servicos"),
    onError: onSaveError,
  });
  const themeMutation = useSaveTenantTheme(tenantId, {
    onSuccess: () => onSaveSuccess("aparencia"),
    onError: onSaveError,
  });

  const savingSection: SecaoEdicao | null = infoMutation.isPending
    ? "informacoes"
    : hoursMutation.isPending
      ? "expediente"
      : servicesMutation.isPending
        ? "servicos"
        : themeMutation.isPending
          ? "aparencia"
          : null;

  /**
   * Validação falhou: mostra o erro e leva o usuário até a aba do campo.
   * (Sem isso o submit abortava em silêncio — nenhum request/feedback.)
   */
  function handleInvalid(errors: FieldErrors<TenantEditFormValues>) {
    const firstKey = Object.keys(errors)[0];
    if (firstKey === "horarios") setSecaoAtiva("expediente");
    else if (firstKey === "servicos") setSecaoAtiva("servicos");
    else setSecaoAtiva("informacoes");

    const detail = firstErrorMessage(errors);
    setSaveMsg(null);
    setSaveError(detail ? `${t("saveError")} ${detail}` : t("saveError"));
  }

  /** Aba Informações → PATCH /tenants/:id (valida só os campos da aba). */
  async function saveInfo() {
    const valid = await methods.trigger([
      "nome",
      "slug",
      "telefone",
      "segment",
      "cnpj",
      "endereco",
      "redesSociais",
      "bannerWide",
      "cover",
    ]);
    if (!valid) {
      handleInvalid(methods.formState.errors);
      return;
    }
    const data = methods.getValues();
    infoMutation.mutate({
      nome: data.nome,
      telefone: data.telefone,
      segment: data.segment,
      cnpj: data.cnpj,
      redesSociais: data.redesSociais,
      bannerWide: data.bannerWide,
      cover: data.cover,
      endereco: data.endereco,
    });
  }

  /** Aba Expediente → working-hours do profissional. */
  async function saveHours() {
    const valid = await methods.trigger("horarios");
    if (!valid) {
      handleInvalid(methods.formState.errors);
      return;
    }
    hoursMutation.mutate({ horarios: methods.getValues("horarios"), hoursTpId });
  }

  /** Aba Serviços → POST/PATCH/DELETE /tenants/:id/services (diff). */
  async function saveServices() {
    const valid = await methods.trigger("servicos");
    if (!valid) {
      handleInvalid(methods.formState.errors);
      return;
    }
    servicesMutation.mutate({
      servicos: methods.getValues("servicos"),
      existing: servicesQuery.data ?? [],
    });
  }

  /** Aba Aparência → PUT /tenants/:id/theme. */
  async function saveTheme() {
    if (!canCustomize) return;
    themeMutation.mutate(tema as unknown as TenantThemeData);
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
    savingSection,
    savedSection,
    saveInfo,
    saveHours,
    saveServices,
    saveTheme,
    handleInvalid,
    refetchTenants,
  };
}
