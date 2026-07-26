"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usersService } from "@/features/professional/api/users.service";
import { professionalKeys } from "@/features/professional/api/professional.keys";

/** GET /users/me — usado por ProfessionalProfileCard/Shortcut. */
export function useMe() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: professionalKeys.me(userId),
    queryFn: () => usersService.getMe(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
