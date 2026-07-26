import { api } from "@/shared/lib/api/client";
import { TenantProfessional, ProfessionalType, BookingMode } from "@/shared/lib/api/types";

/**
 * Duplicado de `src/features/professional/api/tenant-professionals.service.ts`
 * e do trecho de `usersService.createProfessionalProfile`
 * (`src/features/user/api/users.service.ts`) — ADR-003: feature ↛ feature.
 * Mesmos endpoints/payloads; usado apenas pelos fluxos de criação/edição do
 * tenant (onboarding do owner como profissional + vínculo à equipe).
 */

/** Duplicado de `CreateProfessionalProfileRequest` (feature `user`). */
export interface TenantOwnerProfessionalProfileDto {
  displayName: string;
  professionalType: ProfessionalType;
  bookingMode?: BookingMode;
  whatsappNumber?: string;
  instagramUsername?: string;
  experienceYears: number;
  bio?: string | null;
}

export const tenantTeamService = {
  /** GET /tenants/:tenantId/tenant-professionals — membership (todos, com activeOnly opcional). */
  list: async (
    tenantId: string,
    activeOnly = true,
  ): Promise<TenantProfessional[]> => {
    return api.get(`/tenants/${tenantId}/tenant-professionals`, {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
  },

  bindMe: async (tenantId: string): Promise<TenantProfessional> => {
    return api.post(`/tenants/${tenantId}/tenant-professionals/me`);
  },

  addOfferedServices: async (
    tenantId: string,
    tpId: string,
    serviceIds: string[],
  ): Promise<unknown[]> => {
    return Promise.all(
      serviceIds.map((serviceId) =>
        api.post(
          `/tenants/${tenantId}/tenant-professionals/${tpId}/offered-services`,
          { serviceId },
        ),
      ),
    );
  },

  /** POST /users/me/professional-profile — cria o perfil profissional do owner. */
  createOwnerProfessionalProfile: async (
    data: TenantOwnerProfessionalProfileDto,
  ): Promise<unknown> => {
    return api.post("/users/me/professional-profile", data);
  },
};
