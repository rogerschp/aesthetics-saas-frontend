"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { bookingService } from "@/features/booking/api/booking.service";
import { MyBooking } from "@/shared/lib/api/types";
import { bookingKeys } from "@/features/booking/api/booking.keys";

/** GET /users/me/bookings — usado por ProfileBookings. */
export function useMyBookings() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: bookingKeys.myBookings(userId),
    queryFn: () => bookingService.getMyBookings(),
    enabled: !!userId,
  });
}

type Callbacks = Pick<
  UseMutationOptions<unknown, unknown, MyBooking>,
  "onSuccess" | "onError"
>;

function useInvalidateMyBookings() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings(userId) });
}

/** PATCH .../bookings/public/:id/cancel — usado por ProfileBookings. */
export function useCancelMyBooking(options?: Callbacks) {
  const invalidate = useInvalidateMyBookings();
  return useMutation({
    mutationFn: (b: MyBooking) =>
      bookingService.cancelPublic(
        b.tenant.id,
        b.professional.tenantProfessionalId,
        b.id,
      ),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PATCH .../bookings/public/:id/confirm — usado por ProfileBookings. */
export function useConfirmMyBooking(options?: Callbacks) {
  const invalidate = useInvalidateMyBookings();
  return useMutation({
    mutationFn: (b: MyBooking) =>
      bookingService.confirmPublic(
        b.tenant.id,
        b.professional.tenantProfessionalId,
        b.id,
      ),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
