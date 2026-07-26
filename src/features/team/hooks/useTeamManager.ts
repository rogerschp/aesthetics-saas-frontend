"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  teamService,
  type OnboardTeamMemberDto,
  type OnboardTeamMemberResponse,
} from "@/features/team/api/team.service";
import { TenantInvitationStatus } from "@/features/team/model/team.types";
import { teamKeys } from "@/features/team/api/team.keys";

/** GET /tenants/:tenantId/team — usado por TeamManager. */
export function useTeamMembers(tenantId: string) {
  return useQuery({
    queryKey: teamKeys.members(tenantId),
    queryFn: () => teamService.listMembers(tenantId),
    enabled: !!tenantId,
  });
}

/** GET /tenants/:tenantId/team/invitations?status=PENDING — usado por TeamManager. */
export function useTeamInvitations(tenantId: string, canManage: boolean) {
  return useQuery({
    queryKey: teamKeys.invitations(tenantId),
    queryFn: () =>
      teamService.listInvitations(tenantId, TenantInvitationStatus.PENDING),
    enabled: !!tenantId && canManage,
  });
}

function useInvalidateTeam(tenantId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: teamKeys.members(tenantId) });
    queryClient.invalidateQueries({ queryKey: teamKeys.invitations(tenantId) });
    // TenantEditPage carrega o time via query própria — mantém em sincronia.
    queryClient.invalidateQueries({ queryKey: teamKeys.editTeam(tenantId) });
  };
}

type Callbacks<TData, TVariables> = Pick<
  UseMutationOptions<TData, unknown, TVariables>,
  "onSuccess" | "onError" | "onMutate" | "onSettled"
>;

/** POST /tenants/:tenantId/team/onboard — usado por TeamManager. */
export function useOnboardTeamMember(
  tenantId: string,
  options?: Callbacks<OnboardTeamMemberResponse, OnboardTeamMemberDto>,
) {
  const invalidate = useInvalidateTeam(tenantId);
  return useMutation({
    mutationFn: (payload: OnboardTeamMemberDto) =>
      teamService.onboard(tenantId, payload),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** DELETE /tenants/:tenantId/team/invitations/:id — usado por TeamManager. */
export function useCancelTeamInvitation(
  tenantId: string,
  options?: Callbacks<unknown, string>,
) {
  const invalidate = useInvalidateTeam(tenantId);
  return useMutation({
    mutationFn: (invitationId: string) =>
      teamService.cancelInvitation(tenantId, invitationId),
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
  });
}

/** DELETE /tenants/:tenantId/members/:userId — usado por TeamManager. */
export function useRemoveTeamMember(
  tenantId: string,
  options?: Callbacks<void, string>,
) {
  const invalidate = useInvalidateTeam(tenantId);
  return useMutation({
    mutationFn: (userId: string) => teamService.removeMember(tenantId, userId),
    onMutate: options?.onMutate,
    onSuccess: (...args) => {
      invalidate();
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
}
