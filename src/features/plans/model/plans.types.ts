export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface SubscriptionHistoryEvent {
  id: string;
  event: string;
  fromPlanId: string | null;
  toPlanId: string | null;
  performedBy: string;
  createdAt: string;
}
