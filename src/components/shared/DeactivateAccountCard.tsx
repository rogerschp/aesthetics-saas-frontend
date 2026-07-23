"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Loader2, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersService } from "@/lib/api/services/users.service";
import { formatApiError } from "@/lib/api/errors";
import { clearCachedIdToken } from "@/lib/api/client";
import { TENANT_STORAGE_KEY } from "@/components/providers/TenantProvider";
import { useRouter } from "@/i18n/routing";

const CONFIRM_WORD = "DESATIVAR";

export function DeactivateAccountCard() {
  const t = useTranslations("AccountDeactivate");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => usersService.deactivateMe(),
    onSuccess: async () => {
      setError(null);
      queryClient.clear();
      clearCachedIdToken();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TENANT_STORAGE_KEY);
      }
      await signOut({ redirect: false });
      router.push("/");
    },
    onError: (err) => setError(formatApiError(err) || t("error")),
  });

  const canSubmit = confirm.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <section className="space-y-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
      <div className="flex items-start gap-3">
        <UserX className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
        <div>
          <h3 className="text-lg font-bold text-red-200">{t("title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("hint")}</p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="deactivate-confirm">{t("confirmLabel", { word: CONFIRM_WORD })}</Label>
        <Input
          id="deactivate-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={CONFIRM_WORD}
          autoComplete="off"
          className="border-zinc-800 bg-background"
        />
      </div>

      <Button
        variant="destructive"
        disabled={mutation.isPending || !canSubmit}
        onClick={() => {
          if (
            typeof window !== "undefined" &&
            !window.confirm(t("confirmDialog"))
          ) {
            return;
          }
          mutation.mutate();
        }}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserX className="mr-2 h-4 w-4" />
        )}
        {t("button")}
      </Button>
    </section>
  );
}
