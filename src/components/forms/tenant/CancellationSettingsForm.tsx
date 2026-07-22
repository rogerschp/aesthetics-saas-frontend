"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tenantsService } from "@/lib/api/services/tenants.service";
import { formatApiError } from "@/lib/api/errors";

interface Props {
  tenantId: string;
  initialEnabled: boolean;
  initialLeadMinutes: number;
  onSaved?: () => void;
}

export function CancellationSettingsForm({
  tenantId,
  initialEnabled,
  initialLeadMinutes,
  onSaved,
}: Props) {
  const t = useTranslations("CancelSettings");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [lead, setLead] = useState<number>(initialLeadMinutes);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      tenantsService.update(tenantId, {
        clientCanCancelConfirmed: enabled,
        clientCancelConfirmedMinLeadMinutes: lead,
      }),
    onSuccess: () => {
      setError(null);
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => {
      setSaved(false);
      setError(formatApiError(err));
    },
  });

  const leadInvalid = lead < 0 || lead > 43200;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--primary)]"
        />
        <span className="text-sm">
          <span className="font-medium text-foreground">{t("allowLabel")}</span>
          <span className="mt-0.5 block text-muted-foreground">
            {t("allowHint")}
          </span>
        </span>
      </label>

      <div className="mt-4 max-w-xs">
        <Label htmlFor="lead" className="mb-1.5 block text-sm">
          {t("minLeadLabel")}
        </Label>
        <Input
          id="lead"
          type="number"
          min={0}
          max={43200}
          value={lead}
          disabled={!enabled}
          onChange={(e) => setLead(Number(e.target.value))}
        />
        <p className="mt-1 text-xs text-muted-foreground">{t("minLeadHint")}</p>
        {leadInvalid && (
          <p className="mt-1 text-xs text-destructive">{t("invalidLead")}</p>
        )}
      </div>

      <Button
        className="mt-5"
        disabled={mutation.isPending || leadInvalid}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="mr-2 h-4 w-4" />
        ) : null}
        {saved ? t("saved") : t("save")}
      </Button>
    </div>
  );
}
