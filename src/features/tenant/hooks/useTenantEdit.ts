"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { tenantsService } from "@/features/tenant/api/tenants.service";
import { tenantTeamService } from "@/features/tenant/api/tenant-team.service";
import { themeService } from "@/features/tenant/api/theme.service";
import {
  tenantWorkingHoursService,
  type FormDayHours,
} from "@/features/tenant/api/working-hours.service";
import { Address, Service, TenantSegment } from "@/shared/lib/api/types";
import { catalogService } from "@/features/tenant/api/catalog.service";
import { Tenant } from "@/features/tenant/model/tenant.types";
import { TenantThemeData } from "@/features/tenant/model/theme.types";
import { tenantKeys } from "@/features/tenant/api/tenant.keys";
import { digitsOnly, phoneToApiDigits } from "@/shared/lib/masks";
import { geocodeAddress } from "@/shared/lib/geocode";

/** GET /tenants/by-id/:id — usado por TenantEditPage. */
export function useTenantEdit(tenantId?: string) {
  return useQuery({
    queryKey: tenantKeys.edit(tenantId),
    queryFn: () => tenantsService.getById(tenantId!),
    enabled: !!tenantId,
  });
}

/** GET .../tenant-professionals (todos, ativo+inativo) — usado por TenantEditPage. */
export function useTenantEditTeam(tenantId?: string) {
  return useQuery({
    queryKey: tenantKeys.editTeam(tenantId),
    queryFn: () => tenantTeamService.list(tenantId!, false),
    enabled: !!tenantId,
  });
}

/** GET .../working-hours — expediente do 1º profissional ativo. */
export function useTenantEditHours(tenantId?: string, hoursTpId?: string | null) {
  return useQuery({
    queryKey: tenantKeys.editHours(tenantId, hoursTpId),
    queryFn: () =>
      tenantWorkingHoursService.listWorkingHours(tenantId!, hoursTpId!),
    enabled: !!tenantId && !!hoursTpId,
    retry: false,
  });
}

/**
 * GET /tenants/:tenantId/subscription — duplicado de `useSubscription`
 * (feature `plans`), mesma tupla de cache (`tenantKeys.subscription` ==
 * `plansKeys.subscription`). Usado por TenantEditPage p/ saber se pode
 * customizar o tema.
 */
export function useTenantSubscription(tenantId?: string) {
  return useQuery({
    queryKey: tenantKeys.subscription(tenantId),
    queryFn: () => tenantsService.getSubscription(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** GET .../theme — usado por TenantEditPage (só quando o plano permite customizar). */
export function useTenantEditTheme(tenantId?: string, canCustomize?: boolean) {
  return useQuery({
    queryKey: tenantKeys.editTheme(tenantId),
    queryFn: () => themeService.get(tenantId!),
    enabled: !!tenantId && !!canCustomize,
    retry: false,
  });
}

export interface SaveTenantEditAddress {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  complement?: string;
}

export interface SaveTenantInfoInput {
  nome: string;
  telefone: string;
  segment: TenantSegment;
  cnpj?: string;
  redesSociais: { instagram?: string; facebook?: string };
  bannerWide?: string;
  cover?: string;
  endereco: SaveTenantEditAddress;
}

export interface SaveWorkingHoursInput {
  horarios: FormDayHours[];
  hoursTpId: string | null;
}

export interface SaveTenantServicesInput {
  servicos: Array<{
    titulo: string;
    itens: Array<{ descricao: string; preco: number; duracao: number }>;
  }>;
  existing: Service[];
}

type SaveOptions<TInput> = Pick<
  UseMutationOptions<void, unknown, TInput>,
  "onSuccess" | "onError"
>;

/** PATCH /tenants/:id — aba Informações (nome, contato, endereço, redes). */
export function useSaveTenantInfo(
  tenantId: string | undefined,
  options?: SaveOptions<SaveTenantInfoInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveTenantInfoInput) => {
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
        ...(geo ? { latitude: geo.latitude, longitude: geo.longitude } : {}),
      });
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.edit(tenantId) });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** Working-hours do profissional — aba Expediente. */
export function useSaveWorkingHours(
  tenantId: string | undefined,
  options?: SaveOptions<SaveWorkingHoursInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveWorkingHoursInput) => {
      if (!tenantId) throw new Error("no-tenant");

      let tpId = data.hoursTpId;
      if (!tpId) {
        try {
          const bound = await tenantTeamService.bindMe(tenantId);
          tpId = bound.id;
        } catch {
          // Sem profissional vinculado — segue sem expediente.
        }
      }
      if (tpId) {
        await tenantWorkingHoursService.syncWeekFromForm(
          tenantId,
          tpId,
          data.horarios,
        );
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: tenantKeys.editHoursAll(tenantId),
      });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PUT /tenants/:id/theme — aba Aparência. */
export function useSaveTenantTheme(
  tenantId: string | undefined,
  options?: SaveOptions<TenantThemeData>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tema: TenantThemeData) => {
      if (!tenantId) throw new Error("no-tenant");
      await themeService.upsert(tenantId, tema);
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.editTheme(tenantId) });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/**
 * Catálogo — aba Serviços. Faz diff por nome contra os serviços ativos:
 * cria os novos, atualiza preço dos existentes e remove os que saíram
 * do formulário (POST/PATCH/DELETE /tenants/:id/services).
 */
export function useSaveTenantServices(
  tenantId: string | undefined,
  options?: SaveOptions<SaveTenantServicesInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveTenantServicesInput) => {
      if (!tenantId) throw new Error("no-tenant");

      const desired = data.servicos
        .flatMap((cat) =>
          cat.itens.map((item) => {
            const titulo = cat.titulo.trim();
            const descricao = item.descricao.trim();
            // Na edição os serviços atuais vêm na categoria sintética
            // "Serviços" com o nome completo em `descricao`.
            const name =
              !titulo || titulo === "Serviços"
                ? descricao
                : `${titulo} - ${descricao}`;
            return {
              name,
              description: titulo || undefined,
              price: item.preco,
              durationInMinutes: item.duracao || 30,
            };
          }),
        )
        .filter((d) => d.name);

      const activeExisting = data.existing.filter((s) => s.isActive);
      const existingByName = new Map(activeExisting.map((s) => [s.name, s]));
      const desiredNames = new Set(desired.map((d) => d.name));

      for (const item of desired) {
        const match = existingByName.get(item.name);
        if (match) {
          if (
            Number(match.price) !== item.price ||
            match.durationInMinutes !== item.durationInMinutes
          ) {
            await catalogService.update(tenantId, match.id, {
              price: item.price,
              durationInMinutes: item.durationInMinutes,
            });
          }
        } else {
          await catalogService.create(tenantId, {
            name: item.name,
            description: item.description,
            price: item.price,
            durationInMinutes: item.durationInMinutes,
          });
        }
      }

      for (const service of activeExisting) {
        if (!desiredNames.has(service.name)) {
          await catalogService.delete(tenantId, service.id);
        }
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: tenantKeys.editServices(tenantId),
      });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

export type { Tenant };
