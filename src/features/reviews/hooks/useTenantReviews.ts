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
  type ReplyReviewDto,
} from "@/features/reviews/api/reviews.service";
import { Review } from "@/shared/lib/api/types";
import { reviewsKeys } from "@/features/reviews/api/reviews.keys";

/** GET /tenants/:tenantId/reviews — usado por ReviewsWall. */
export function useTenantReviews(tenantId: string) {
  return useQuery({
    queryKey: reviewsKeys.tenant(tenantId),
    queryFn: () => reviewsService.listTenant(tenantId),
    enabled: !!tenantId,
  });
}

type Callbacks<TVariables> = Pick<
  UseMutationOptions<Review, unknown, TVariables>,
  "onSuccess" | "onError"
>;

/** POST /tenants/:tenantId/reviews — upsert. */
export function useUpsertTenantReview(
  tenantId: string,
  options?: Callbacks<CreateReviewDto>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewDto) =>
      reviewsService.upsertTenant(tenantId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.tenant(tenantId) });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PATCH /tenants/:tenantId/reviews/:id/reply. */
export function useReplyTenantReview(
  tenantId: string,
  options?: Callbacks<{ id: string; reply: string }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      reviewsService.replyTenant(tenantId, id, { reply } as ReplyReviewDto),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.tenant(tenantId) });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
