"use client";

import { useEffect } from "react";

/** Registra o service worker do PWA (somente em produção — evita cache no dev). */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        /* PWA é progressivo: sem SW o site funciona normalmente. */
      });
  }, []);

  return null;
}
