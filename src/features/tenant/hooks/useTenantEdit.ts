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
import { Address, TenantSegment } from "@/shared/lib/api/types";
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

export interface SaveTenantEditInput {
  nome: string;
  telefone: string;
  segment: TenantSegment;
  cnpj?: string;
  redesSociais: { instagram?: string; facebook?: string };
  bannerWide?: string;
  cover?: string;
  endereco: SaveTenantEditAddress;
  horarios: FormDayHours[];
  hoursTpId: string | null;
  canCustomize: boolean;
  tema: TenantThemeData | null;
  shouldSaveTheme: boolean;
}

/**
 * Orquestra o save completo do TenantEditPage: dados do tenant, expediente e
 * (opcionalmente) tema. Mantém a mesma sequência/comportamento do form original.
 */
export function useSaveTenantEdit(
  tenantId: string | undefined,
  options?: Pick<
    UseMutationOptions<void, unknown, SaveTenantEditInput>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveTenantEditInput) => {
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

      if (data.canCustomize && data.tema && data.shouldSaveTheme) {
        try {
          await themeService.upsert(tenantId, data.tema);
        } catch {
          // Plano pode bloquear tema — não falha o save do tenant.
        }
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.edit(tenantId) });
      queryClient.invalidateQueries({ queryKey: tenantKeys.editHoursAll(tenantId) });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

export type { Tenant };
