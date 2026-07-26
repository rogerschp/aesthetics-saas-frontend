"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  usersService,
  type CreateProfessionalProfileRequest,
  type UpdateProfessionalProfileRequest,
} from "@/features/professional/api/users.service";
import { ProfessionalProfile } from "@/shared/lib/api/types";
import { professionalKeys } from "@/features/professional/api/professional.keys";

type Callbacks<TVariables> = Pick<
  UseMutationOptions<ProfessionalProfile, unknown, TVariables>,
  "onSuccess" | "onError"
>;

function useInvalidateProfile() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: professionalKeys.myProfile(userId) });
    queryClient.invalidateQueries({ queryKey: professionalKeys.me(userId) });
  };
}

/** POST /users/me/professional-profile. */
export function useCreateProfessionalProfile(
  options?: Callbacks<CreateProfessionalProfileRequest>,
) {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (payload: CreateProfessionalProfileRequest) =>
      usersService.createProfessionalProfile(payload),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PATCH /users/me/professional-profile. */
export function useUpdateProfessionalProfile(
  options?: Callbacks<UpdateProfessionalProfileRequest>,
) {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (payload: UpdateProfessionalProfileRequest) =>
      usersService.updateProfessionalProfile(payload),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PATCH /users/me/professional-profile/deactivate. */
export function useDeactivateProfessionalProfile(options?: Callbacks<void>) {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: () => usersService.deactivateProfessionalProfile(),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** PATCH /users/me/professional-profile/activate. */
export function useActivateProfessionalProfile(options?: Callbacks<void>) {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: () => usersService.activateProfessionalProfile(),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}
