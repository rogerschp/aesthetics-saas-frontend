import { sessionKeys } from "@/shared/lib/api/session.keys";

export const professionalKeys = {
  /** Mesma identidade de cache que sessionKeys.me / userKeys.me (mesmo endpoint). */
  me: sessionKeys.me,
  myProfile: (userId?: string) => ["my-professional-profile", userId] as const,
  /** Mesmo endpoint que reviewsKeys.professional (feature reviews) — literal igual. */
  reviews: (userId?: string) => ["professional-reviews", userId] as const,
  myTeam: (userId?: string, tenantId?: string) =>
    ["barbeiro-tp", userId, tenantId] as const,
};
