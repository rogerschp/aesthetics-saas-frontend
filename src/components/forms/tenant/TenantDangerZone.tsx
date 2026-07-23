"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { formatApiError } from "@/lib/api/errors";
import { TENANT_STORAGE_KEY } from "@/components/providers/TenantProvider";
import { TenantStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface TenantDangerZoneProps {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  status: TenantStatus | string;
  onStatusChange?: () => void;
}

export function TenantDangerZone({
  tenantId,
  tenantSlug,
  tenantName,
  status,
  onStatusChange,
}: TenantDangerZoneProps) {
  const t = useTranslations("TenantDanger");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmSlug, setConfirmSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isInactive = status === TenantStatus.INACTIVE;

  const statusMutation = useMutation({
    mutationFn: (next: TenantStatus) =>
      tenantsService.update(tenantId, { status: next }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["tenant-edit", tenantId] });
      await queryClient.invalidateQueries({ queryKey: ["me-tenants"] });
      onStatusChange?.();
    },
    onError: (err) => setError(formatApiError(err) || t("error")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tenantsService.delete(tenantId),
    onSuccess: async () => {
      setError(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TENANT_STORAGE_KEY);
      }
      await queryClient.invalidateQueries({ queryKey: ["me-tenants"] });
      router.push("/painel");
    },
    onError: (err) => setError(formatApiError(err) || t("error")),
  });

  const canDelete = confirmSlug.trim() === tenantSlug;
  const busy = statusMutation.isPending || deleteMutation.isPending;

  return (
    <section className="space-y-6 rounded-3xl border border-red-500/30 bg-red-500/5 p-6 sm:p-8">
      <div>
        <h3 className="text-lg font-bold text-red-300">{t("title")}</h3>
        <p className="mt-1 text-sm text-zinc-400">{t("subtitle")}</p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">{t("statusTitle")}</p>
          <p className="text-sm text-muted-foreground">
            {isInactive ? t("statusInactiveHint") : t("statusActiveHint")}
          </p>
          <p
            className={cn(
              "mt-1 text-xs font-semibold uppercase tracking-wide",
              isInactive ? "text-amber-400" : "text-emerald-400",
            )}
          >
            {isInactive ? t("badgeInactive") : t("badgeActive")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() =>
            statusMutation.mutate(
              isInactive ? TenantStatus.ACTIVE : TenantStatus.INACTIVE,
            )
          }
          className="shrink-0 border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
        >
          {statusMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Power className="mr-2 h-4 w-4" />
          )}
          {isInactive ? t("activate") : t("deactivate")}
        </Button>
      </div>

      <div className="space-y-3 rounded-2xl border border-red-500/40 bg-black/30 p-4">
        <div>
          <p className="font-medium text-red-200">{t("deleteTitle")}</p>
          <p className="text-sm text-zinc-400">
            {t("deleteHint", { name: tenantName, slug: tenantSlug })}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-slug">{t("confirmLabel")}</Label>
          <Input
            id="confirm-slug"
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            placeholder={tenantSlug}
            className="border-zinc-800 bg-zinc-950"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          disabled={busy || !canDelete}
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              !window.confirm(t("deleteConfirm", { name: tenantName }))
            ) {
              return;
            }
            deleteMutation.mutate();
          }}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {t("deleteBtn")}
        </Button>
      </div>
    </section>
  );
}
