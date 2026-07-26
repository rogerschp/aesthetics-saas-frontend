"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMe } from "@/features/professional/hooks/useMe";
import { useMyProfessionalProfile } from "@/features/professional/hooks/useMyProfessionalProfile";
import { useMyTenantTeam } from "@/features/professional/hooks/useTenantTeam";
import { useProfessionalReviews } from "@/features/professional/hooks/useProfessionalReviews";
import { useTenantContext } from "@/shared/providers/TenantProvider";
import {
  daysInclusive,
  defaultRange,
} from "@/shared/components/DateRangeFields";

const MAX_RANGE_DAYS = 31;

/**
 * Orquestra dados e estado do dashboard do profissional (`/barbeiro/[id]`).
 *
 * Não busca a agenda (booking) — a página chama `useMyProfessionalAgenda`
 * diretamente e usa `tenantId`/`myTpId`/`range` daqui (ADR-003: feature ↛ feature).
 */
export function useProfessionalDashboard() {
  const t = useTranslations("BarbeiroDashboard");
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id;
  const { current, isLoading: tenantLoading } = useTenantContext();
  const tenantId = current?.tenant.id;
  const [range, setRange] = useState(() => defaultRange(0, 0));

  const rangeError =
    range.from && range.to && range.from > range.to
      ? t("rangeOrderError")
      : range.from &&
          range.to &&
          daysInclusive(range.from, range.to) > MAX_RANGE_DAYS
        ? t("rangeMaxError", { max: MAX_RANGE_DAYS })
        : null;

  const meQuery = useMe();
  const profileQuery = useMyProfessionalProfile();
  const teamQuery = useMyTenantTeam(sessionUserId, tenantId);

  const myTp = useMemo(() => {
    const userId = meQuery.data?.id;
    const profileId = profileQuery.isSuccess
      ? profileQuery.data?.id
      : undefined;
    if (!teamQuery.data || (!userId && !profileId)) return null;
    return (
      teamQuery.data.find(
        (tp) =>
          tp.professionalProfile?.id === profileId ||
          tp.professionalProfile?.userId === userId,
      ) ?? null
    );
  }, [
    teamQuery.data,
    meQuery.data?.id,
    profileQuery.isSuccess,
    profileQuery.data?.id,
  ]);

  const userId = meQuery.data?.id;
  const reviewsQuery = useProfessionalReviews(userId ?? "");

  const isInitialLoading =
    !sessionUserId ||
    meQuery.isLoading ||
    profileQuery.isLoading ||
    tenantLoading;

  const profile = profileQuery.data ?? null;

  const reviews = reviewsQuery.data;
  const rating =
    reviews && reviews.totalReviews > 0
      ? reviews.averageRating.toFixed(1)
      : "—";
  const reviewsCount = reviews?.totalReviews ?? 0;

  const hasSchedule = !!tenantId && !!myTp;

  return {
    isInitialLoading,
    profile,
    userId,
    sessionUserId,
    tenantId,
    myTpId: myTp?.id,
    rating,
    reviewsCount,
    range,
    setRange,
    rangeError,
    hasSchedule,
  };
}
