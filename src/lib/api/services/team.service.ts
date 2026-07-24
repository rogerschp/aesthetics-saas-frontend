import { api } from "../client";
import {
  OnboardTeamMemberDto,
  OnboardTeamMemberResponse,
  TeamInvitation,
  TeamMember,
  TenantInvitationStatus,
} from "../types";

function base(tenantId: string) {
  return `/tenants/${tenantId}/team`;
}

export const teamService = {
  /** POST /tenants/:tenantId/team/onboard — adiciona membro ou cria convite. */
  onboard: async (
    tenantId: string,
    payload: OnboardTeamMemberDto,
  ): Promise<OnboardTeamMemberResponse> => {
    return api.post(`${base(tenantId)}/onboard`, {
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
    });
  },

  /** GET /tenants/:tenantId/team */
  listMembers: async (tenantId: string): Promise<TeamMember[]> => {
    return api.get(base(tenantId));
  },

  /** GET /tenants/:tenantId/team/invitations?status= */
  listInvitations: async (
    tenantId: string,
    status?: TenantInvitationStatus,
  ): Promise<TeamInvitation[]> => {
    return api.get(`${base(tenantId)}/invitations`, {
      params: status ? { status } : undefined,
    });
  },

  /** DELETE /tenants/:tenantId/team/invitations/:id — cancela PENDING. */
  cancelInvitation: async (
    tenantId: string,
    invitationId: string,
  ): Promise<TeamInvitation> => {
    return api.delete(
      `${base(tenantId)}/invitations/${invitationId}`,
    );
  },

  /** DELETE /tenants/:tenantId/members/:userId — remove vínculo (não apaga o User). */
  removeMember: async (tenantId: string, userId: string): Promise<void> => {
    await api.delete(`/tenants/${tenantId}/members/${userId}`);
  },
};
