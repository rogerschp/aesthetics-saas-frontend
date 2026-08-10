"use client";

import { TenantEditPage } from "@/features/tenant/components/TenantEditPage";
import { TeamManager } from "@/features/team/components/TeamManager";
import { ReviewsWall } from "@/features/reviews/components/ReviewsWall";

export default function Page() {
  return (
    <TenantEditPage
      renderTeamSection={(tenantId, canManageTenant) => (
        <TeamManager tenantId={tenantId} canManage={canManageTenant} />
      )}
      renderReviewsSection={(tenantId) => <ReviewsWall tenantId={tenantId} />}
    />
  );
}
