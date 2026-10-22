"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/shared/lib/api/services/notifications.service";
import { professionalKeys } from "@/features/professional/api/professional.keys";

type TelegramState =
  | "loading"
  | "not-linked"
  | "awaiting-start"
  | "linked"
  | "bot-not-configured"
  | "error";

/**
 * Vinculação do Telegram do profissional.
 * - `connect()` pede um link t.me ao backend e abre o bot em nova aba.
 * - Enquanto aguarda o /start, faz polling do status a cada 5s (até 5 min).
 * - Quando o webhook do bot chega, o status vira `linked` automaticamente.
 */
export function useTelegramNotifications() {
  const queryClient = useQueryClient();
  const [awaitingSince, setAwaitingSince] = useState<number | null>(null);
  const [botNotConfigured, setBotNotConfigured] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const statusQuery = useQuery({
    queryKey: professionalKeys.telegramStatus(),
    queryFn: () => notificationsService.getTelegramStatus(),
    retry: false,
    refetchInterval: (query) => {
      if (query.state.data?.linked) return false;
      return awaitingSince !== null ? 5000 : false;
    },
  });

  const linked = statusQuery.data?.linked ?? false;

  // Aguarda o /start por até 5 min (estado derivado, sem sync em effect).
  const awaiting =
    awaitingSince !== null && !linked && now - awaitingSince <= 5 * 60_000;

  useEffect(() => {
    if (awaitingSince === null || linked) return;
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, [awaitingSince, linked]);

  const linkMutation = useMutation({
    mutationFn: () => notificationsService.getTelegramLink(),
    onSuccess: (data) => {
      if (!data.url) {
        setBotNotConfigured(true);
        return;
      }
      setBotNotConfigured(false);
      window.open(data.url, "_blank", "noopener,noreferrer");
      setAwaitingSince(Date.now());
    },
  });

  const connect = useCallback(() => linkMutation.mutate(), [linkMutation]);

  const checkNow = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: professionalKeys.telegramStatus(),
    });
  }, [queryClient]);

  const state: TelegramState = statusQuery.isPending
    ? "loading"
    : statusQuery.isError
      ? "error"
      : linked
        ? "linked"
        : botNotConfigured
          ? "bot-not-configured"
          : awaiting
            ? "awaiting-start"
            : "not-linked";

  return {
    state,
    linkedAt: statusQuery.data?.linkedAt ?? null,
    connecting: linkMutation.isPending,
    connect,
    checkNow,
    refresh: statusQuery.refetch,
  };
}
