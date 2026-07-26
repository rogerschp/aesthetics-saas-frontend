"use client";

import { ProfessionalPublicProfile } from "@/features/professional/components/ProfessionalPublicProfile";
import { ProfessionalReviewsWall } from "@/features/reviews/components/ProfessionalReviewsWall";

export function ProfessionalPublicProfileShell({
  userId,
}: {
  userId: string;
}) {
  return (
    <ProfessionalPublicProfile
      userId={userId}
      reviewsWall={
        <ProfessionalReviewsWall professionalUserId={userId} />
      }
    />
  );
}
