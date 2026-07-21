import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import {routing} from '@/i18n/routing';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'common'});
  return {
    title: {
      default: t('siteName'),
      template: `%s · ${t('siteName')}`
    },
    description: t('tagline')
  };
}

// Applies the stored theme before first paint to avoid a flash.
// Dark is the default; light is opt-in.
const themeScript = `
try {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.remove('dark');
  }
} catch (e) {}
`;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{__html: themeScript}} />
        <NextIntlClientProvider>
          <Header />
          <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
