"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  reviewsService,
  type CreateReviewDto,
} from "@/features/reviews/api/reviews.service";
import { Review } from "@/shared/lib/api/types";
import { reviewsKeys } from "@/features/reviews/api/reviews.keys";

/** GET /users/:userId/professional-profile/reviews — usado por ProfessionalReviewsWall. */
export function useProfessionalReviewsWall(professionalUserId: string) {
  return useQuery({
    queryKey: reviewsKeys.professional(professionalUserId),
    queryFn: () => reviewsService.listProfessional(professionalUserId),
    enabled: !!professionalUserId,
  });
}

type Callbacks<TVariables> = Pick<
  UseMutationOptions<Review, unknown, TVariables>,
  "onSuccess" | "onError"
>;

/** POST /users/:userId/professional-profile/reviews — upsert. */
export function useUpsertProfessionalReview(
  professionalUserId: string,
  options?: Callbacks<CreateReviewDto>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewDto) =>
      reviewsService.upsertProfessional(professionalUserId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.professional(professionalUserId),
      });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PATCH /users/me/professional-profile/reviews/:id/reply. */
export function useReplyProfessionalReview(
  professionalUserId: string,
  options?: Callbacks<{ id: string; reply: string }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      reviewsService.replyMyProfessional(id, { reply }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.professional(professionalUserId),
      });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
