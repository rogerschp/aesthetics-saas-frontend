"use client";

import { useForm, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { tenantsService } from "@/features/tenant/api/tenants.service";
import { catalogService } from "@/features/tenant/api/catalog.service";
import { tenantTeamService } from "@/features/tenant/api/tenant-team.service";
import { tenantWorkingHoursService } from "@/features/tenant/api/working-hours.service";
import { Address, ProfessionalType } from "@/shared/lib/api/types";
import { formatApiError } from "@/shared/lib/api/errors";
import { digitsOnly, phoneToApiDigits } from "@/shared/lib/masks";
import { geocodeAddress } from "@/shared/lib/geocode";
import { TENANT_STORAGE_KEY } from "@/shared/providers/TenantProvider";
import { sessionKeys } from "@/shared/lib/api/session.keys";

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

const tenantCreateSchema = z.object({
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

export type TenantCreateFormValues = z.infer<typeof tenantCreateSchema>;

const EMPTY_ADDRESS: Address = {
  street: "",
  number: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brazil",
  complement: "",
};

const defaultValues: TenantCreateFormValues = {
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

function firstInvalidTab(errors: FieldErrors<TenantCreateFormValues>): string {
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
  errors: FieldErrors<TenantCreateFormValues>,
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
      out.push(
        ...flattenErrors(value as FieldErrors<TenantCreateFormValues>, path),
      );
    }
  }
  return out;
}

export interface UseTenantCreateFormResult {
  methods: UseFormReturn<TenantCreateFormValues>;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formError: string | null;
  onSubmit: (data: TenantCreateFormValues) => Promise<void>;
  onInvalid: (errors: FieldErrors<TenantCreateFormValues>) => void;
  handleNextTab: (next: string) => void;
}

/** Orquestra a criação completa de um Tenant (`/painel/estabelecimento/criar`). */
export function useTenantCreateForm(): UseTenantCreateFormResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [formError, setFormError] = useState<string | null>(null);

  const methods = useForm<TenantCreateFormValues>({
    resolver: zodResolver(tenantCreateSchema),
    defaultValues,
  });

  const onSubmit = async (data: TenantCreateFormValues) => {
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
        await tenantTeamService.createOwnerProfessionalProfile({
          displayName: `${data.nome.trim()} Admin`,
          professionalType: ProfessionalType.BARBER,
          experienceYears: 1,
        });
      } catch {
        // Perfil já existe — segue.
      }

      const tp = await tenantTeamService.bindMe(tenant.id);

      if (createdServicesIds.length > 0) {
        await tenantTeamService.addOfferedServices(
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

      await tenantWorkingHoursService.bootstrapWeek(tenant.id, tp.id, {
        closedDays,
        periods,
        overwriteExisting: true,
      });

      localStorage.setItem(TENANT_STORAGE_KEY, tenant.id);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.tenantsAll });
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

  const onInvalid = (errors: FieldErrors<TenantCreateFormValues>) => {
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

  return {
    methods,
    isLoading,
    activeTab,
    setActiveTab,
    formError,
    onSubmit,
    onInvalid,
    handleNextTab,
  };
}
