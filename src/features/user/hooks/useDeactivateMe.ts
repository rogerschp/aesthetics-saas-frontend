"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { usersService } from "@/features/user/api/users.service";

/** PATCH /users/me/deactivate — usado por DeactivateAccountCard. */
export function useDeactivateMe(
  options?: Pick<
    UseMutationOptions<Awaited<ReturnType<typeof usersService.deactivateMe>>, unknown, void>,
    "onSuccess" | "onError"
  >,
) {
  return useMutation({
    mutationFn: () => usersService.deactivateMe(),
    ...options,
  });
}
