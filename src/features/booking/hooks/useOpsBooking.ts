"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { availabilityService } from "@/features/booking/api/availability.service";
import { bookingService } from "@/features/booking/api/booking.service";
import { Booking, OpsBooking } from "@/features/booking/model/booking.types";
import { bookingKeys } from "@/features/booking/api/booking.keys";

/** GET /tenants/:tenantId/tenant-professionals — usado por OpsBookingPanel. */
export function useOpsProfessionals(tenantId: string) {
  return useQuery({
    queryKey: bookingKeys.opsProfessionals(tenantId),
    queryFn: () => bookingService.listOpsProfessionals(tenantId, true),
  });
}

/** GET /tenants/:tenantId/services — usado por OpsBookingPanel. */
export function useOpsServices(tenantId: string) {
  return useQuery({
    queryKey: bookingKeys.opsServices(tenantId),
    queryFn: () => bookingService.listOpsServices(tenantId),
  });
}

/** GET .../available-slots — usado por OpsBookingPanel. */
export function useOpsSlots(
  tenantId: string,
  professionalId: string,
  serviceId: string,
  date: string,
) {
  return useQuery({
    queryKey: bookingKeys.opsSlots(tenantId, professionalId, serviceId, date),
    queryFn: () =>
      availabilityService.getAvailableSlots(
        tenantId,
        professionalId,
        serviceId,
        date,
      ),
    enabled: !!professionalId && !!serviceId && !!date,
  });
}

/** GET /tenants/:tenantId/bookings?from=&to= — usado por OpsBookingPanel. */
export function useOpsAgenda(
  tenantId: string,
  from: string,
  to: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: bookingKeys.opsAgenda(tenantId, from, to),
    queryFn: () => bookingService.listTenant(tenantId, { from, to }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useInvalidateOpsAgenda(tenantId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: bookingKeys.opsAgendaAll(tenantId) });
}

export interface CreateOpsDraftInput {
  professionalId: string;
  serviceId: string;
  date: string;
  startTime: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string | null;
}

/** POST .../bookings/draft — usado por OpsBookingPanel. */
export function useCreateOpsBookingDraft(
  tenantId: string,
  options?: Pick<
    UseMutationOptions<Booking, unknown, CreateOpsDraftInput>,
    "onSuccess" | "onError"
  >,
) {
  return useMutation({
    mutationFn: (input: CreateOpsDraftInput) =>
      bookingService.createOpsDraft(tenantId, input.professionalId, {
        serviceId: input.serviceId,
        date: input.date,
        startTime: input.startTime,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail,
      }),
    ...options,
  });
}

export interface OpsBookingActionInput {
  booking: OpsBooking;
  action: "confirm" | "cancel" | "complete";
}

/** PATCH .../bookings/:id/(confirm|cancel|complete) — usado por OpsBookingPanel. */
export function useOpsBookingAction(
  tenantId: string,
  options?: Pick<
    UseMutationOptions<Booking, unknown, OpsBookingActionInput>,
    "onSuccess" | "onError"
  >,
) {
  return useMutation({
    mutationFn: async ({ booking, action }: OpsBookingActionInput) => {
      const tpId = booking.professional.tenantProfessionalId;
      if (action === "confirm") return bookingService.confirmOps(tenantId, tpId, booking.id);
      if (action === "complete")
        return bookingService.completeOps(tenantId, tpId, booking.id);
      return bookingService.cancelOps(tenantId, tpId, booking.id);
    },
    ...options,
  });
}
