"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";

const DISMISS_KEY = "pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const noopSubscribe = () => () => {};

function subscribeStandalone(callback: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function getIsIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function getWasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return true;
  }
}

/**
 * Banner discreto de instalação do PWA:
 * - Android/desktop: usa o `beforeinstallprompt` nativo.
 * - iOS (sem prompt automático): mostra a instrução Compartilhar → Tela de Início.
 * Some quando já instalado, e lembra a dispensa em localStorage.
 */
export function PwaInstallPrompt() {
  const t = useTranslations("Pwa");
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getIsStandalone,
    () => true, // SSR: não renderiza (evita flash/hydration mismatch)
  );
  const isIOS = useSyncExternalStore(noopSubscribe, getIsIOS, () => false);
  const storedDismissed = useSyncExternalStore(
    noopSubscribe,
    getWasDismissed,
    () => true,
  );
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const isDismissed = dismissed ?? storedDismissed;
  const canPromptInstall = deferredPrompt !== null;
  if (isStandalone || isDismissed || (!canPromptInstall && !isIOS)) {
    return null;
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage indisponível: só esconde nesta sessão */
    }
    setDismissed(true);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") setDeferredPrompt(null);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:mx-0">
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-1 flex items-center gap-2 pr-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt=""
          className="h-9 w-9 rounded-[10px]"
        />
        <h3 className="text-sm font-bold">{t("installTitle")}</h3>
      </div>
      <p className="mb-3 pl-[44px] text-xs leading-relaxed text-muted-foreground">
        {isIOS && !canPromptInstall ? t("iosInstructions") : t("installDesc")}
      </p>

      <div className="flex gap-2 pl-[44px]">
        {canPromptInstall && (
          <Button size="sm" onClick={install}>
            <Download className="mr-2 h-4 w-4" />
            {t("install")}
          </Button>
        )}
        {isIOS && !canPromptInstall && (
          <Share className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        )}
        <Button size="sm" variant="ghost" onClick={dismiss}>
          {t("notNow")}
        </Button>
      </div>
    </div>
  );
}
