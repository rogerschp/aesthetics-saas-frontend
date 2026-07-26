import { api } from "@/shared/lib/api/client";
import { ReviewList } from "@/shared/lib/api/types";

export const reviewsService = {
  /** GET /users/:userId/professional-profile/reviews — público. */
  listProfessional: async (userId: string): Promise<ReviewList> => {
    return api.get(`/users/${userId}/professional-profile/reviews`);
  },
};
