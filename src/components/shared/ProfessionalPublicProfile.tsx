"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Star, UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfessionalReviewsWall } from "@/components/shared/ProfessionalReviewsWall";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { formatApiError } from "@/lib/api/errors";

interface ProfessionalPublicProfileProps {
  userId: string;
}

/**
 * Página pública do profissional: média + mural de avaliações.
 * Não há GET público de perfil completo — usamos a lista de reviews.
 */
export function ProfessionalPublicProfile({
  userId,
}: ProfessionalPublicProfileProps) {
  const t = useTranslations("ProfessionalReviews");

  const reviewsQuery = useQuery({
    queryKey: ["professional-reviews", userId],
    queryFn: () => reviewsService.listProfessional(userId),
    enabled: !!userId,
    retry: false,
  });

  if (reviewsQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {formatApiError(reviewsQuery.error) || t("notFound")}
      </p>
    );
  }

  const data = reviewsQuery.data;
  const average = data?.averageRating;
  const total = data?.totalReviews ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-secondary">
            <UserCircle2 className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{t("profileLabel")}</p>
          {total > 0 && average != null ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">
                {average.toFixed(1)}
              </span>
              <span>
                · {total} {t("reviewsCount")}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{t("noRatingYet")}</p>
          )}
        </div>
      </div>

      <ProfessionalReviewsWall professionalUserId={userId} />
    </div>
  );
}
