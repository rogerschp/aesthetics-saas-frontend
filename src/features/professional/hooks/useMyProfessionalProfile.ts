"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usersService } from "@/features/professional/api/users.service";
import { professionalKeys } from "@/features/professional/api/professional.keys";

/** GET /users/me/professional-profile. */
export function useMyProfessionalProfile() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: professionalKeys.myProfile(userId),
    queryFn: () => usersService.getProfessionalProfile(),
    enabled: !!userId,
    retry: false,
  });
}
