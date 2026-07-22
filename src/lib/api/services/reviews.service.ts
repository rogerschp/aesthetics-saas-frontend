import { api } from "../client";
import { Review, ReviewList } from "../types";

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface ReplyReviewDto {
  reply: string;
}

export const reviewsService = {
  /** GET /tenants/:tenantId/reviews — público. */
  listTenant: async (tenantId: string): Promise<ReviewList> => {
    const response = await api.get(`/tenants/${tenantId}/reviews`);
    return response as any;
  },

  /** POST /tenants/:tenantId/reviews — Bearer; plano STANDARD+. */
  createTenant: async (
    tenantId: string,
    payload: CreateReviewDto,
  ): Promise<Review> => {
    const response = await api.post(`/tenants/${tenantId}/reviews`, payload);
    return response as any;
  },

  /** PATCH /tenants/:tenantId/reviews/:id/reply — OWNER/ADMIN. */
  replyTenant: async (
    tenantId: string,
    reviewId: string,
    payload: ReplyReviewDto,
  ): Promise<Review> => {
    const response = await api.patch(
      `/tenants/${tenantId}/reviews/${reviewId}/reply`,
      payload,
    );
    return response as any;
  },

  /** GET /users/:userId/professional-profile/reviews — público. */
  listProfessional: async (userId: string): Promise<ReviewList> => {
    const response = await api.get(
      `/users/${userId}/professional-profile/reviews`,
    );
    return response as any;
  },
};
