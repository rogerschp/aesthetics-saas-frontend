"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Check, Crown, Loader2, MessageCircle, Scissors, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { plansService } from "@/lib/api/services/plans.service";
import { formatApiError } from "@/lib/api/errors";
import { useTenantContext } from "@/components/providers/TenantProvider";
import {
  formatBillingCycle,
  formatPlanPrice,
  isPaidPlan,
  planDisplayName,
  planFeatureBullets,
  planQuoteHref,
} from "@/lib/plans";
import type { Plan } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PLAN_ICON: Record<string, typeof Scissors> = {
  FREE: Scissors,
  STANDARD: Star,
  PRO: Crown,
  ELITE: Zap,
};

function PlanCard({
  plan,
  highlight,
  tenantName,
  userName,
}: {
  plan: Plan;
  highlight?: boolean;
  tenantName?: string | null;
  userName?: string | null;
}) {
  const t = useTranslations("Planos");
  const Icon = PLAN_ICON[plan.name] ?? Scissors;
  const bullets = planFeatureBullets(plan.features);
  const paid = isPaidPlan(plan);
  const quoteHref = planQuoteHref(planDisplayName(plan.name), {
    tenantName,
    userName,
  });

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border p-8 transition-colors",
        highlight
          ? "border-primary/50 bg-card shadow-[0_0_40px_rgba(212,175,55,0.15)] md:-translate-y-4"
          : "border-border/60 bg-card/80 hover:border-border",
      )}
    >
      {highlight && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
          {t("popularBadge")}
        </div>
      )}

      <div className="mb-6">
        <Icon
          className={cn(
            "mb-4 h-8 w-8",
            highlight ? "text-primary" : "text-muted-foreground",
          )}
        />
        <h3 className="mb-2 text-2xl font-bold text-foreground">
          {planDisplayName(plan.name)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(`desc.${plan.name}` as "desc.FREE")}
        </p>
      </div>

      <div className="mb-8">
        <span className="text-4xl font-bold text-foreground">
          {formatPlanPrice(plan)}
        </span>
        <span className="text-muted-foreground">
          {formatBillingCycle(plan.billingCycle)}
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {bullets.map((line) => (
          <li
            key={line}
            className="flex items-start text-sm text-muted-foreground"
          >
            <Check className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className={highlight ? "font-medium text-foreground" : undefined}>
              {line}
            </span>
          </li>
        ))}
      </ul>

      {paid ? (
        <a href={quoteHref} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button
            className={cn(
              "h-12 w-full gap-2 font-bold",
              highlight && "shadow-lg shadow-primary/20",
            )}
          >
            <MessageCircle className="h-4 w-4" />
            {t("quoteBtn")}
          </Button>
        </a>
      ) : (
        <Link href="/painel/estabelecimento/criar" className="w-full">
          <Button variant="outline" className="h-12 w-full">
            {t("freeBtn")}
          </Button>
        </Link>
      )}
    </div>
  );
}

export function PlansCatalog() {
  const t = useTranslations("Planos");
  const { data: session } = useSession();
  const { current } = useTenantContext();

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.list(),
  });

  if (plansQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (plansQuery.isError) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        {formatApiError(plansQuery.error)}
      </p>
    );
  }

  const plans = (plansQuery.data ?? [])
    .filter((p) => p.isActive)
    .sort((a, b) => a.sortWeight - b.sortWeight);

  return (
    <>
      <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-muted-foreground">
        {t("noGatewayNote")}
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            highlight={plan.name === "PRO"}
            tenantName={current?.tenant.name}
            userName={session?.user?.name}
          />
        ))}
      </div>
    </>
  );
}
