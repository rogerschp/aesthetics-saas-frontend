"use client";

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { availabilityService } from "@/features/booking/api/availability.service";
import { bookingService } from "@/features/booking/api/booking.service";
import { Booking } from "@/features/booking/model/booking.types";
import { bookingKeys } from "@/features/booking/api/booking.keys";

/** GET .../available-slots/public — usado por BookingWizard. */
export function usePublicSlots(
  tenantId: string,
  professionalId?: string,
  serviceId?: string,
  date?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: bookingKeys.publicSlots(tenantId, professionalId, serviceId, date),
    queryFn: () =>
      availabilityService.getAvailableSlotsPublic(
        tenantId,
        professionalId!,
        serviceId!,
        date!,
      ),
    enabled: enabled && !!professionalId && !!serviceId && !!date,
  });
}

export interface CreateBookingDraftInput {
  tenantId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  startTime: string;
  guest?: { name: string; phone: string; email?: string };
}

/**
 * Cria (e confirma, se logado) uma reserva pública/guest — usado por BookingWizard.
 * Mantém a mesma lógica original: logado cria draft + confirma; anônimo cria guest draft.
 */
export function useCreateBookingDraft(
  isLogged: boolean,
  options?: Pick<
    UseMutationOptions<Booking, unknown, CreateBookingDraftInput>,
    "onSuccess" | "onError"
  >,
) {
  return useMutation({
    mutationFn: async (input: CreateBookingDraftInput) => {
      const payload = {
        serviceId: input.serviceId,
        date: input.date,
        startTime: input.startTime,
      };
      if (isLogged) {
        const draft = await bookingService.createPublicDraft(
          input.tenantId,
          input.professionalId,
          payload,
        );
        return bookingService.confirmPublic(
          input.tenantId,
          input.professionalId,
          draft.id,
        );
      }
      return bookingService.createGuestDraft(input.tenantId, input.professionalId, {
        ...payload,
        guestName: input.guest?.name.trim() ?? "",
        guestPhone: input.guest?.phone.trim() ?? "",
        guestEmail: input.guest?.email?.trim() || undefined,
      });
    },
    ...options,
  });
}
