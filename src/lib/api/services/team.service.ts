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
    const response = await api.post(`${base(tenantId)}/onboard`, {
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
    });
    return response as any;
  },

  /** GET /tenants/:tenantId/team */
  listMembers: async (tenantId: string): Promise<TeamMember[]> => {
    const response = await api.get(base(tenantId));
    return response as any;
  },

  /** GET /tenants/:tenantId/team/invitations?status= */
  listInvitations: async (
    tenantId: string,
    status?: TenantInvitationStatus,
  ): Promise<TeamInvitation[]> => {
    const response = await api.get(`${base(tenantId)}/invitations`, {
      params: status ? { status } : undefined,
    });
    return response as any;
  },

  /** DELETE /tenants/:tenantId/team/invitations/:id — cancela PENDING. */
  cancelInvitation: async (
    tenantId: string,
    invitationId: string,
  ): Promise<TeamInvitation> => {
    const response = await api.delete(
      `${base(tenantId)}/invitations/${invitationId}`,
    );
    return response as any;
  },

  /** DELETE /tenants/:tenantId/members/:userId — remove vínculo (não apaga o User). */
  removeMember: async (tenantId: string, userId: string): Promise<void> => {
    await api.delete(`/tenants/${tenantId}/members/${userId}`);
  },
};
