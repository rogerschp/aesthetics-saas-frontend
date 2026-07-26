"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

/**
 * Evita mostrar chaves cruas tipo `LoginForm.errorMessage` na UI
 * quando a tradução estiver faltando.
 */
export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if (error.code === "MISSING_MESSAGE") {
          console.warn(`[i18n] ${error.message}`);
          return;
        }
        console.error(error);
      }}
      getMessageFallback={({ namespace, key }) => {
        const path = [namespace, key].filter(Boolean).join(".");
        if (process.env.NODE_ENV !== "production") {
          return `[missing: ${path}]`;
        }
        return "Algo deu errado. Tente novamente.";
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
