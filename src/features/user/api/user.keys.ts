import { sessionKeys } from "@/shared/lib/api/session.keys";

/**
 * `me` reuses `sessionKeys.me` on purpose: usersService.getMe() and
 * sessionService.getMe() hit the same `/users/me` endpoint, so they must
 * share cache identity with the shared Header/TenantProvider queries.
 */
export const userKeys = {
  me: sessionKeys.me,
};
