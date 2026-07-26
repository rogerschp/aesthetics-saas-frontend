import type { TenantUserRole } from "@/shared/lib/api/types";
import type { TeamInvitation, TeamMember } from "@/features/team/model/team.types";

export type OnboardTeamMemberDto = {
  email: string;
  role: TenantUserRole;
};

export type OnboardTeamMemberResponse =
  | {
      kind: 'MEMBER_ADDED';
      member: TeamMember;
      tenantProfessionalId?: string;
    }
  | {
      kind: 'INVITATION_CREATED';
      invitation: TeamInvitation;
    };
