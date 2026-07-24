import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { IntlProvider } from "@/components/providers/IntlProvider";
import { Header } from "@/components/shared/Header";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberShop SaaS",
  description: "A plataforma premium de agendamento para barbearias, salões de beleza e estúdios de tatuagem.",
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
      <body className="min-h-full flex flex-col font-sans">
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
