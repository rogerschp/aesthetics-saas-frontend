import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { IntlProvider } from "@/shared/providers/IntlProvider";
import { Header } from "@/shared/components/Header";
import { Providers } from "@/shared/providers/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberShop SaaS",
  description: "A plataforma premium de agendamento para barbearias, salões de beleza e estúdios de tatuagem.",
  // Site already uses a dark theme; stop Dark Reader from rewriting SVGs
  // (injects data-darkreader-* / inline styles → React hydration mismatch overlay).
  other: {
    "darkreader-lock": "darkreader-lock",
  },
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
        <IntlProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            {children}
          </Providers>
        </IntlProvider>
      </body>
    </html>
  );
}
