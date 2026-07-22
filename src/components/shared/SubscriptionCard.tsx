"use client";

import { useQuery } from "@tanstack/react-query";
import { Crown, Loader2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { subscriptionService } from "@/lib/api/services/subscription.service";
import { SubscriptionStatus } from "@/lib/api/types";
import { getErrorCode, formatApiError } from "@/lib/api/errors";

const STATUS_KEY: Record<string, string> = {
  ACTIVE: "statusActive",
  GRACE_PERIOD: "statusGrace",
  EXPIRED: "statusExpired",
  CANCELLED: "statusCancelled",
};

const REPORTS_KEY: Record<string, string> = {
  NONE: "reportsNone",
  BASIC: "reportsBasic",
  INTERMEDIATE: "reportsIntermediate",
  ADVANCED: "reportsAdvanced",
};

const CUSTOM_KEY: Record<string, string> = {
  NONE: "customNone",
  BASIC: "customBasic",
  INTERMEDIATE: "customIntermediate",
  FULL: "customFull",
};

function statusVariant(status: string): string {
  if (status === SubscriptionStatus.ACTIVE) return "bg-primary/15 text-primary";
  if (status === SubscriptionStatus.GRACE_PERIOD)
    return "bg-amber-500/15 text-amber-500";
  return "bg-destructive/15 text-destructive";
}

export function SubscriptionCard({ tenantId }: { tenantId: string }) {
  const t = useTranslations("Assinatura");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: () => subscriptionService.get(tenantId),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    const code = getErrorCode(error);
    const notFound = code === "SUBSCRIPTION_NOT_FOUND";
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card p-6">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">
            {notFound ? t("noSubscription") : t("unavailable")}
          </p>
          <p className="text-sm text-muted-foreground">
            {notFound ? t("noPlan") : formatApiError(error)}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const f = data.plan.features;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">
            {t("plan", { name: data.plan.name })}
          </span>
        </div>
        <Badge className={statusVariant(String(data.status))}>
          {STATUS_KEY[String(data.status)]
            ? t(STATUS_KEY[String(data.status)])
            : String(data.status)}
        </Badge>
      </div>

      <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <li>
          {t("professionals")}{" "}
          <span className="font-medium text-foreground">
            {f.maxProfessionals ?? t("unlimited")}
          </span>
        </li>
        <li>
          <span className="font-medium text-foreground">
            {REPORTS_KEY[f.reports] ? t(REPORTS_KEY[f.reports]) : f.reports}
          </span>
        </li>
        <li>
          {t("reviews")}{" "}
          <span className="font-medium text-foreground">
            {f.reviews ? t("yes") : t("no")}
          </span>
        </li>
        <li>
          <span className="font-medium text-foreground">
            {CUSTOM_KEY[f.customization]
              ? t(CUSTOM_KEY[f.customization])
              : f.customization}
          </span>
        </li>
      </ul>

      {data.currentPeriodEnd && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("validUntil", {
            date: new Date(data.currentPeriodEnd).toLocaleDateString("pt-BR"),
          })}
        </p>
      )}
    </div>
  );
}
