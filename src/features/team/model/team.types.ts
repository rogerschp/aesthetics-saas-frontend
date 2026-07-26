import { TenantUserRole, TenantUserStatus } from "@/shared/lib/api/types";

// ============ Tenant Member ============
/** @deprecated Entidade legada de membership — usar `TeamMember` (DTO de listagem) ou `Membership`. */
export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  createdAt: string;
}

/** Membro na lista `GET /tenants/:id/team`. */
export interface TeamMember {
  membershipId: string;
  userId: string;
  email: string;
  name: string;
  role: TenantUserRole;
  status: TenantUserStatus;
}

export enum TenantInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface TeamInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: TenantUserRole;
  status: TenantInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdByUserId: string;
  createdAt: string;
}
