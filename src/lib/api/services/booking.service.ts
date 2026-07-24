import { api } from "../client";
import { Booking, BookingStatus, OpsBooking } from "../types";

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

export interface BookingSlotDraftDto {
  serviceId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
}

export interface GuestBookingDraftDto extends BookingSlotDraftDto {
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
}

/** XOR ops: clientUserId OU (guestName+guestPhone) OU nenhum (fallback logado). */
export interface OpsBookingDraftDto extends BookingSlotDraftDto {
  clientUserId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string | null;
}

function base(tenantId: string, tpId: string) {
  return `/tenants/${tenantId}/tenant-professionals/${tpId}/bookings`;
}

export const bookingService = {
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
