"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usersService } from "@/features/user/api/users.service";
import { userKeys } from "@/features/user/api/user.keys";

/** GET /users/me — usado por ProfileEditForm e ProfileHeader. */
export function useMe() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: userKeys.me(userId),
    queryFn: () => usersService.getMe(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
