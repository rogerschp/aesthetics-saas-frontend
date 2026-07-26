"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { reviewsService } from "@/features/reviews/api/reviews.service";
import type { Review, ReviewComment } from "@/shared/lib/api/types";

export type CommentTarget =
  | { kind: "tenant"; tenantId: string }
  | { kind: "professional"; userId: string };

type Callbacks<TData, TVariables> = Pick<
  UseMutationOptions<TData, unknown, TVariables>,
  "onSuccess" | "onError"
>;

/** POST .../reviews/:id/comments — usado por ReviewCommentsBlock. */
export function useAddReviewComment(
  target: CommentTarget,
  review: Review,
  invalidateKey: unknown[],
  options?: Callbacks<ReviewComment, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => {
      const payload = { body: body.trim() };
      return target.kind === "tenant"
        ? reviewsService.addTenantComment(target.tenantId, review.id, payload)
        : reviewsService.addProfessionalComment(
            target.userId,
            review.id,
            payload,
          );
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** DELETE .../reviews/:id/comments/:commentId — usado por ReviewCommentsBlock. */
export function useDeleteReviewComment(
  target: CommentTarget,
  review: Review,
  invalidateKey: unknown[],
  options?: Callbacks<void, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      target.kind === "tenant"
        ? reviewsService.deleteTenantComment(
            target.tenantId,
            review.id,
            commentId,
          )
        : reviewsService.deleteProfessionalComment(
            target.userId,
            review.id,
            commentId,
          ),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
