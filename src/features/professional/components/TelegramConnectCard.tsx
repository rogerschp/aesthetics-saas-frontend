"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { useTelegramNotifications } from "@/features/professional/hooks/useTelegramNotifications";

export function TelegramConnectCard() {
  const t = useTranslations("TelegramNotifications");
  const format = useFormatter();
  const {
    state,
    linkedAt,
    connecting,
    connect,
    checkNow,
    refresh,
  } = useTelegramNotifications();

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <Send className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">{t("title")}</h3>
        {state === "linked" && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
            {t("linkedTitle")}
          </span>
        )}
      </div>

      {state === "loading" && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {state === "error" && (
        <>
          <p className="mb-4 text-sm text-destructive">{t("loadError")}</p>
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        </>
      )}

      {state === "not-linked" && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("description")}
          </p>
          <Button onClick={connect} disabled={connecting}>
            {connecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {connecting ? t("connecting") : t("connect")}
          </Button>
        </>
      )}

      {state === "awaiting-start" && (
        <>
          <p className="mb-1 text-sm font-medium text-foreground">
            {t("awaitingTitle")}
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("awaitingDesc")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={checkNow}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t("checkNow")}
            </Button>
            <Button variant="ghost" onClick={connect} disabled={connecting}>
              {connecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {t("openAgain")}
            </Button>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            </span>
          </div>
        </>
      )}

      {state === "linked" && (
        <>
          <p className="mb-1 flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {t("linkedDesc")}
          </p>
          {linkedAt && (
            <p className="text-xs text-muted-foreground">
              {t("linkedSince", {
                date: format.dateTime(new Date(linkedAt), {
                  dateStyle: "medium",
                }),
              })}
            </p>
          )}
        </>
      )}

      {state === "bot-not-configured" && (
        <p className="flex items-start gap-2 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {t("botNotConfigured")}
        </p>
      )}
    </div>
  );
}
