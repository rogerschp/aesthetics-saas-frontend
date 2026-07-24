import { api } from "../client";
import { Review, ReviewComment, ReviewList } from "../types";

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface ReplyReviewDto {
  reply: string;
}

export interface CreateReviewCommentDto {
  body: string;
}

export const reviewsService = {
  /** GET /tenants/:tenantId/reviews — público. */
  listTenant: async (tenantId: string): Promise<ReviewList> => {
    return api.get(`/tenants/${tenantId}/reviews`);
  },

  /** POST /tenants/:tenantId/reviews — Bearer; UPSERT (201 create / 200 update). */
  upsertTenant: async (
    tenantId: string,
    payload: CreateReviewDto,
  ): Promise<Review> => {
    return api.post(`/tenants/${tenantId}/reviews`, payload);
  },

  /** @deprecated use upsertTenant */
  createTenant: async (
    tenantId: string,
    payload: CreateReviewDto,
  ): Promise<Review> => reviewsService.upsertTenant(tenantId, payload),

  /** PATCH /tenants/:tenantId/reviews/:id/reply — OWNER/ADMIN. */
  replyTenant: async (
    tenantId: string,
    reviewId: string,
    payload: ReplyReviewDto,
  ): Promise<Review> => {
    return api.patch(
      `/tenants/${tenantId}/reviews/${reviewId}/reply`,
      payload,
    );
  },

  /** POST /tenants/:tenantId/reviews/:id/comments — autor da review. */
  addTenantComment: async (
    tenantId: string,
    reviewId: string,
    payload: CreateReviewCommentDto,
  ): Promise<ReviewComment> => {
    return api.post(
      `/tenants/${tenantId}/reviews/${reviewId}/comments`,
      payload,
    );
  },

  /** DELETE /tenants/:tenantId/reviews/:id/comments/:commentId — autor. */
  deleteTenantComment: async (
    tenantId: string,
    reviewId: string,
    commentId: string,
  ): Promise<void> => {
    await api.delete(
      `/tenants/${tenantId}/reviews/${reviewId}/comments/${commentId}`,
    );
  },

  /** GET /users/:userId/professional-profile/reviews — público. */
  listProfessional: async (userId: string): Promise<ReviewList> => {
    return api.get(
      `/users/${userId}/professional-profile/reviews`,
    );
  },

  /** POST /users/:userId/professional-profile/reviews — Bearer; UPSERT. */
  upsertProfessional: async (
    userId: string,
    payload: CreateReviewDto,
  ): Promise<Review> => {
    return api.post(
      `/users/${userId}/professional-profile/reviews`,
      payload,
    );
  },

  /** @deprecated use upsertProfessional */
  createProfessional: async (
    userId: string,
    payload: CreateReviewDto,
  ): Promise<Review> => reviewsService.upsertProfessional(userId, payload),

  /** PATCH /users/me/professional-profile/reviews/:id/reply — próprio profissional. */
  replyMyProfessional: async (
    reviewId: string,
    payload: ReplyReviewDto,
  ): Promise<Review> => {
    return api.patch(
      `/users/me/professional-profile/reviews/${reviewId}/reply`,
      payload,
    );
  },

  /** PATCH /users/me/professional-profile/reviews/:id — autor. */
  updateMyProfessional: async (
    reviewId: string,
    payload: CreateReviewDto,
  ): Promise<Review> => {
    return api.patch(
      `/users/me/professional-profile/reviews/${reviewId}`,
      payload,
    );
  },

  /** POST /users/:userId/professional-profile/reviews/:id/comments — autor. */
  addProfessionalComment: async (
    userId: string,
    reviewId: string,
    payload: CreateReviewCommentDto,
  ): Promise<ReviewComment> => {
    return api.post(
      `/users/${userId}/professional-profile/reviews/${reviewId}/comments`,
      payload,
    );
  },

  /** DELETE /users/:userId/professional-profile/reviews/:id/comments/:commentId. */
  deleteProfessionalComment: async (
    userId: string,
    reviewId: string,
    commentId: string,
  ): Promise<void> => {
    await api.delete(
      `/users/${userId}/professional-profile/reviews/${reviewId}/comments/${commentId}`,
    );
  },

  /** DELETE /users/me/professional-profile/reviews/:id — autor ou profissional. */
  deleteMyProfessional: async (reviewId: string): Promise<void> => {
    await api.delete(`/users/me/professional-profile/reviews/${reviewId}`);
  },
};
