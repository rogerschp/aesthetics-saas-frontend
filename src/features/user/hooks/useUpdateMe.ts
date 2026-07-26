"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  usersService,
  type UpdateMyUserRequest,
} from "@/features/user/api/users.service";
import { userKeys } from "@/features/user/api/user.keys";

/** PATCH /users/me — usado por ProfileEditForm. */
export function useUpdateMe(
  options?: Pick<
    UseMutationOptions<Awaited<ReturnType<typeof usersService.updateMe>>, unknown, UpdateMyUserRequest>,
    "onSuccess" | "onError"
  >,
) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyUserRequest) => usersService.updateMe(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me(userId) });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
