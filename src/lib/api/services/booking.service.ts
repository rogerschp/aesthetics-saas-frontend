import { api } from "../client";
import { Booking, BookingStatus, OpsBooking } from "../types";

export interface ListOpsBookingsParams {
  date?: string; // yyyy-MM-dd
  status?: BookingStatus;
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
    const response = await api.post(`${base(tenantId, tpId)}/guest/draft`, payload);
    return response as any;
  },

  // ---------- Cliente logado (sem membership) ----------
  /** POST .../bookings/public/draft — Bearer; clientUserId = self. */
  createPublicDraft: async (
    tenantId: string,
    tpId: string,
    payload: BookingSlotDraftDto,
  ): Promise<Booking> => {
    const response = await api.post(`${base(tenantId, tpId)}/public/draft`, payload);
    return response as any;
  },

  /** PATCH .../bookings/public/:id/confirm — Bearer + dono. */
  confirmPublic: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    const response = await api.patch(
      `${base(tenantId, tpId)}/public/${bookingId}/confirm`,
    );
    return response as any;
  },

  /** PATCH .../bookings/public/:id/cancel — Bearer + dono (política p/ CONFIRMED). */
  cancelPublic: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    const response = await api.patch(
      `${base(tenantId, tpId)}/public/${bookingId}/cancel`,
    );
    return response as any;
  },

  // ---------- Ops (equipe / membership) ----------
  /** GET /tenants/:tenantId/bookings?date=&status= — OWNER/ADMIN/STAFF. */
  listTenant: async (
    tenantId: string,
    params: ListOpsBookingsParams = {},
  ): Promise<OpsBooking[]> => {
    const response = await api.get(`/tenants/${tenantId}/bookings`, {
      params: {
        ...(params.date ? { date: params.date } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });
    return response as any;
  },

  /** GET .../tenant-professionals/:tpId/bookings?date=&status= — agenda do profissional. */
  listByProfessional: async (
    tenantId: string,
    tpId: string,
    params: ListOpsBookingsParams = {},
  ): Promise<OpsBooking[]> => {
    const response = await api.get(base(tenantId, tpId), {
      params: {
        ...(params.date ? { date: params.date } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });
    return response as any;
  },

  createOpsDraft: async (
    tenantId: string,
    tpId: string,
    payload: OpsBookingDraftDto,
  ): Promise<Booking> => {
    const response = await api.post(`${base(tenantId, tpId)}/draft`, payload);
    return response as any;
  },

  confirmOps: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    const response = await api.patch(`${base(tenantId, tpId)}/${bookingId}/confirm`);
    return response as any;
  },

  cancelOps: async (
    tenantId: string,
    tpId: string,
    bookingId: string,
  ): Promise<Booking> => {
    const response = await api.patch(`${base(tenantId, tpId)}/${bookingId}/cancel`);
    return response as any;
  },
};
