"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewsService } from "@/features/professional/api/reviews.service";
import { professionalKeys } from "@/features/professional/api/professional.keys";

/** GET /users/:userId/professional-profile/reviews — usado por ProfessionalPublicProfile. */
export function useProfessionalReviews(userId: string) {
  return useQuery({
    queryKey: professionalKeys.reviews(userId),
    queryFn: () => reviewsService.listProfessional(userId),
    enabled: !!userId,
    retry: false,
  });
}
