import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { IntlProvider } from "@/shared/providers/IntlProvider";
import { Header } from "@/shared/components/Header";
import { ServiceWorkerRegistration } from "@/shared/components/ServiceWorkerRegistration";
import { PwaInstallPrompt } from "@/shared/components/PwaInstallPrompt";
import { Providers } from "@/shared/providers/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberShop SaaS",
  description: "A plataforma premium de agendamento para barbearias, salões de beleza e estúdios de tatuagem.",
  applicationName: "BarberShop",
  // PWA: instalável (manifest em src/app/manifest.ts)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarberShop",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Site already uses a dark theme; stop Dark Reader from rewriting SVGs
  // (injects data-darkreader-* / inline styles → React hydration mismatch overlay).
  other: {
    "darkreader-lock": "darkreader-lock",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`dark ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <IntlProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            {children}
            <PwaInstallPrompt />
          </Providers>
        </IntlProvider>
      </body>
    </html>
  );
}
