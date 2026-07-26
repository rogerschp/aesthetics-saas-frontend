"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { bookingService } from "@/features/booking/api/booking.service";
import { bookingKeys } from "@/features/booking/api/booking.keys";

/**
 * GET .../tenant-professionals/:tpId/bookings — agenda do dashboard do
 * profissional (`/barbeiro/[id]`).
 */
export function useMyProfessionalAgenda(
  sessionUserId?: string,
  tenantId?: string,
  tpId?: string,
  from?: string,
  to?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: bookingKeys.byProfessional(sessionUserId, tenantId, tpId, from, to),
    queryFn: () =>
      bookingService.listByProfessional(tenantId!, tpId!, { from, to }),
    enabled:
      enabled &&
      !!tenantId &&
      !!tpId &&
      !!sessionUserId &&
      !!from &&
      !!to,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
