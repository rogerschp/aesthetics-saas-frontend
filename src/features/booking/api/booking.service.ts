import { api } from "@/shared/lib/api/client";
import {
  BookingStatus,
  MyBooking,
  Service,
  TenantProfessional,
} from "@/shared/lib/api/types";
import { Booking, OpsBooking } from "@/features/booking/model/booking.types";
import type {
  BookingSlotDraftDto,
  GuestBookingDraftDto,
  OpsBookingDraftDto,
} from "@/features/booking/api/dto/booking.dto";

export type { BookingSlotDraftDto, GuestBookingDraftDto, OpsBookingDraftDto };

export interface ListOpsBookingsParams {
  /** Um dia `yyyy-MM-dd` — XOR com from/to. */
  date?: string;
  /** Início do intervalo (inclusivo) — exige `to`. */
  from?: string;
  /** Fim do intervalo (inclusivo) — exige `from`; máx. 31 dias. */
  to?: string;
  status?: BookingStatus;
}

function opsListParams(params: ListOpsBookingsParams) {
  return {
    ...(params.date ? { date: params.date } : {}),
    ...(params.from && params.to
      ? { from: params.from, to: params.to }
      : {}),
    ...(params.status ? { status: params.status } : {}),
  };
}

function base(tenantId: string, tpId: string) {
  return `/tenants/${tenantId}/tenant-professionals/${tpId}/bookings`;
}

export const bookingService = {
  /** GET /users/me/bookings?status= — Bearer. */
  getMyBookings: async (status?: BookingStatus): Promise<MyBooking[]> => {
    return api.get("/users/me/bookings", {
      params: status ? { status } : undefined,
    });
  },

  /** GET /tenants/:tenantId/tenant-professionals — membership (ops). */
  listOpsProfessionals: async (
    tenantId: string,
    activeOnly = true,
  ): Promise<TenantProfessional[]> => {
    return api.get(`/tenants/${tenantId}/tenant-professionals`, {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
  },

  /** GET /tenants/:tenantId/services — membership (ops). */
  listOpsServices: async (tenantId: string): Promise<Service[]> => {
    return api.get(`/tenants/${tenantId}/services`);
  },

  // ---------- Guest (sem login) ----------
  /** POST .../bookings/guest/draft — sem Bearer. Confirm/cancel guest NÃO existem. */
  createGuestDraft: async (
    tenantId: string,
    tpId: string,
    payload: GuestBookingDraftDto,
  ): Promise<Booking> => {
    return api.post(`${base(tenantId, tpId)}/guest/draft`, payload);
  },

  // ---------- Cliente logado (sem membership) ----------
  /** POST .../bookings/public/draft — Bearer; clientUserId = self. */
  createPublicDraft: async (
    tenantId: string,
    tpId: string,
    payload: BookingSlotDraftDto,
  ): Promise<Booking> => {
    return api.post(`${base(tenantId, tpId)}/public/draft`, payload);
  },

  /** PATCH .../bookings/public/:id/confirm — Bearer + dono. */
  confirmPublic: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    return api.patch(
      `${base(tenantId, tpId)}/public/${bookingId}/confirm`,
    );
  },

  /** PATCH .../bookings/public/:id/cancel — Bearer + dono (política p/ CONFIRMED). */
  cancelPublic: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    return api.patch(
      `${base(tenantId, tpId)}/public/${bookingId}/cancel`,
    );
  },

  // ---------- Ops (equipe / membership) ----------
  /** GET /tenants/:tenantId/bookings?date=|from=&to=&status= — OWNER/ADMIN/STAFF. */
  listTenant: async (
    tenantId: string,
    params: ListOpsBookingsParams = {},
  ): Promise<OpsBooking[]> => {
    return api.get(`/tenants/${tenantId}/bookings`, {
      params: opsListParams(params),
    });
  },

  /** GET .../tenant-professionals/:tpId/bookings?date=|from=&to=&status=. */
  listByProfessional: async (
    tenantId: string,
    tpId: string,
    params: ListOpsBookingsParams = {},
  ): Promise<OpsBooking[]> => {
    return api.get(base(tenantId, tpId), {
      params: opsListParams(params),
    });
  },

  createOpsDraft: async (
    tenantId: string,
    tpId: string,
    payload: OpsBookingDraftDto,
  ): Promise<Booking> => {
    return api.post(`${base(tenantId, tpId)}/draft`, payload);
  },

  confirmOps: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    return api.patch(`${base(tenantId, tpId)}/${bookingId}/confirm`);
  },

  cancelOps: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    return api.patch(`${base(tenantId, tpId)}/${bookingId}/cancel`);
  },

  /** PATCH .../bookings/:id/complete — CONFIRMED → COMPLETED. */
  completeOps: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    return api.patch(
      `${base(tenantId, tpId)}/${bookingId}/complete`,
    );
  },
};
