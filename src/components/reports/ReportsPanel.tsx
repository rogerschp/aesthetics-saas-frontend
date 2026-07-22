"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  Download,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { subscriptionService } from "@/lib/api/services/subscription.service";
import {
  defaultReportMonths,
  reportMonthOptions,
  reportsService,
  resolveReportTier,
} from "@/lib/api/services/reports.service";
import { formatApiError, getErrorCode } from "@/lib/api/errors";
import { formatPriceBRL, cn } from "@/lib/utils";
import type {
  EliteReport,
  MonthlyMetrics,
  ProReport,
  ProfessionalMetrics,
  ReportTier,
  StandardReport,
  TopServiceMetrics,
} from "@/lib/api/types";

function isProReport(r: StandardReport): r is ProReport {
  return Array.isArray((r as ProReport).monthlyBreakdown);
}

function isEliteReport(r: StandardReport): r is EliteReport {
  return Array.isArray((r as EliteReport).professionalBreakdown);
}

function formatPeriod(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString("pt-BR");
  const e = new Date(end).toLocaleDateString("pt-BR");
  return `${s} — ${e}`;
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function TopServicesTable({
  items,
  t,
}: {
  items: TopServiceMetrics[];
  t: (key: string) => string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("emptyServices")}</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/50 text-muted-foreground">
          <tr>
            <th className="px-2 py-2 font-medium">{t("colService")}</th>
            <th className="px-2 py-2 font-medium">{t("colQty")}</th>
            <th className="px-2 py-2 font-medium">{t("colRevenue")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.serviceId} className="border-b border-border/30">
              <td className="px-2 py-2.5 text-foreground">{row.serviceName}</td>
              <td className="px-2 py-2.5">{row.quantity}</td>
              <td className="px-2 py-2.5 font-medium">
                {formatPriceBRL(row.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthlyTable({
  items,
  t,
}: {
  items: MonthlyMetrics[];
  t: (key: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/50 text-muted-foreground">
          <tr>
            <th className="px-2 py-2 font-medium">{t("colMonth")}</th>
            <th className="px-2 py-2 font-medium">{t("colRevenue")}</th>
            <th className="px-2 py-2 font-medium">{t("colConfirmed")}</th>
            <th className="px-2 py-2 font-medium">{t("colCancelled")}</th>
            <th className="px-2 py-2 font-medium">{t("colChange")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const change = row.revenueChangePercent;
            return (
              <tr
                key={`${row.year}-${row.month}`}
                className="border-b border-border/30"
              >
                <td className="px-2 py-2.5 text-foreground">
                  {monthLabel(row.year, row.month)}
                </td>
                <td className="px-2 py-2.5 font-medium">
                  {formatPriceBRL(row.revenue)}
                </td>
                <td className="px-2 py-2.5">{row.confirmedBookings}</td>
                <td className="px-2 py-2.5">{row.cancelledBookings}</td>
                <td className="px-2 py-2.5">
                  {change == null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        change >= 0 ? "text-emerald-500" : "text-destructive",
                      )}
                    >
                      {change >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {change.toFixed(1)}%
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProfessionalsTable({
  items,
  t,
}: {
  items: ProfessionalMetrics[];
  t: (key: string) => string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("emptyPros")}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/50 text-muted-foreground">
          <tr>
            <th className="px-2 py-2 font-medium">{t("colProfessional")}</th>
            <th className="px-2 py-2 font-medium">{t("colRevenue")}</th>
            <th className="px-2 py-2 font-medium">{t("colConfirmed")}</th>
            <th className="px-2 py-2 font-medium">{t("colTicket")}</th>
            <th className="px-2 py-2 font-medium">{t("colCancelRate")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr
              key={row.tenantProfessionalId}
              className="border-b border-border/30"
            >
              <td className="px-2 py-2.5 text-foreground">
                {row.professionalName}
              </td>
              <td className="px-2 py-2.5 font-medium">
                {formatPriceBRL(row.revenue)}
              </td>
              <td className="px-2 py-2.5">{row.confirmedBookings}</td>
              <td className="px-2 py-2.5">{formatPriceBRL(row.averageTicket)}</td>
              <td className="px-2 py-2.5">
                {row.cancellationRate.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatTierLabel(
  tier: ReportTier,
  months: number,
  t: ReturnType<typeof useTranslations<"Reports">>,
): string {
  if (tier === "ADVANCED") return t("tierElite", { months });
  if (tier === "INTERMEDIATE") return t("tierPro", { months });
  return t("tierStandard");
}

export function ReportsPanel({ tenantId }: { tenantId: string }) {
  const t = useTranslations("Reports");
  const [months, setMonths] = useState(3);

  const subQuery = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: () => subscriptionService.get(tenantId),
  });

  const tier = resolveReportTier(subQuery.data?.plan.features);
  const canExport = !!subQuery.data?.plan.features.reportExport;
  const canPickMonths = tier === "INTERMEDIATE" || tier === "ADVANCED";
  const monthChoices = reportMonthOptions(tier);

  // Ao mudar de plano (ex.: Pro → Elite), ajusta default/limites do seletor.
  useEffect(() => {
    if (!canPickMonths) return;
    const fallback = defaultReportMonths(tier);
    const max =
      tier === "ADVANCED"
        ? 6
        : tier === "INTERMEDIATE"
          ? 3
          : fallback;
    setMonths((prev) => (prev >= 1 && prev <= max ? prev : fallback));
  }, [tier, canPickMonths]);

  const reportQuery = useQuery({
    queryKey: ["tenant-report", tenantId, tier, canPickMonths ? months : null],
    queryFn: () =>
      reportsService.getForTier(
        tenantId,
        tier,
        canPickMonths ? months : undefined,
      ),
    enabled: !!subQuery.data && tier !== "NONE",
    retry: false,
  });

  const exportMutation = useMutation({
    mutationFn: (format: "pdf" | "excel") =>
      reportsService.exportAndDownload(tenantId, format, months),
  });

  if (subQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (subQuery.isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {formatApiError(subQuery.error)}
      </p>
    );
  }

  if (tier === "NONE") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/50 bg-card p-8 text-center">
        <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold">{t("lockedTitle")}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t("lockedDesc")}</p>
        <Link href="/planos" className={cn(buttonVariants())}>
          <Sparkles className="mr-2 h-4 w-4" />
          {t("lockedCta")}
        </Link>
      </div>
    );
  }

  if (reportQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reportQuery.isError) {
    const code = getErrorCode(reportQuery.error);
    const planBlocked = code === "PLAN_FEATURE_NOT_AVAILABLE";
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/50 bg-card p-8 text-center">
        <p className="mb-4 text-sm text-destructive">
          {planBlocked ? t("lockedDesc") : formatApiError(reportQuery.error)}
        </p>
        {planBlocked && (
          <Link href="/planos" className={cn(buttonVariants())}>
            {t("lockedCta")}
          </Link>
        )}
      </div>
    );
  }

  const report = reportQuery.data!;
  const d = report.dashboard;
  const tierLabel = formatTierLabel(tier, months, t);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <Badge variant="secondary">{tierLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("periodHint", {
              period: formatPeriod(report.period.start, report.period.end),
            })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("axisHint")}</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          {canPickMonths && (
            <div className="min-w-[140px]">
              <Label htmlFor="report-months" className="mb-1.5 block text-xs">
                {t("monthsLabel")}
              </Label>
              <select
                id="report-months"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {monthChoices.map((m) => (
                  <option key={m} value={m}>
                    {t("monthsOption", { count: m })}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Link
            href="/painel"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("back")}
          </Link>
          {canExport && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate("pdf")}
              >
                {exportMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" />
                )}
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate("excel")}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {exportMutation.isError && (
        <p className="text-sm text-destructive">
          {formatApiError(exportMutation.error)}
        </p>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t("dashboardTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <KpiCard label={t("kpiRevenue")} value={formatPriceBRL(d.revenue)} />
          <KpiCard
            label={t("kpiConfirmed")}
            value={String(d.confirmedBookings)}
          />
          <KpiCard
            label={t("kpiCancelled")}
            value={String(d.cancelledBookings)}
          />
          <KpiCard
            label={t("kpiCancelRate")}
            value={`${d.cancellationRate.toFixed(1)}%`}
          />
          <KpiCard
            label={t("kpiTicket")}
            value={formatPriceBRL(d.averageTicket)}
          />
          <KpiCard
            label={t("kpiNew")}
            value={String(d.newCustomers)}
            hint={t("kpiNewHint")}
          />
          <KpiCard
            label={t("kpiReturning")}
            value={String(d.returningCustomers)}
            hint={t("kpiReturningHint")}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/50 bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">{t("topServicesTitle")}</h2>
        <TopServicesTable items={report.topServices} t={t} />
      </section>

      {isProReport(report) && (
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold">{t("monthlyTitle")}</h2>
          <MonthlyTable items={report.monthlyBreakdown} t={t} />
        </section>
      )}

      {isEliteReport(report) && (
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5 text-primary" />
            {t("prosTitle")}
          </h2>
          <ProfessionalsTable items={report.professionalBreakdown} t={t} />
        </section>
      )}
    </div>
  );
}
