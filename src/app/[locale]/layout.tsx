import type { Metadata } from 'next';
import Providers from './QueryProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ProgressBar from './ProgressBar';
import { BottomNavigation, isSupportedLocale } from '@/shared';
import { GoogleAnalytics } from '@next/third-parties/google';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Meta');

  return {
    title: t('title'),
    description: t('description'),
    keywords:
      '성경, 기독교, 말씀, 신앙, 종교 뉴스, Bible, Christian news, Scripture, Faith, Spirituality'
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale) || !routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <ProgressBar />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <main>{children}</main>
            <BottomNavigation />
          </NextIntlClientProvider>
        </Providers>
        {process.env.NODE_ENV !== 'development' && <GoogleAnalytics gaId="G-P43JHSZ9K8" />}
      </body>
    </html>
  );
}
