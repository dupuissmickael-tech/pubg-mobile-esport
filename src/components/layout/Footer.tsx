import {getTranslations} from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="mt-16 border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4">
        <p>
          <a
            href="https://liquipedia.net/pubgmobile"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent-600 hover:underline dark:text-accent-400"
          >
            {t('liquipediaCredit')}
          </a>{' '}
          — {t('liquipediaLicense')}
        </p>
        <p>{t('disclaimer')}</p>
        <p>
          <a href="/api/rss" className="hover:underline">
            {t('rss')}
          </a>
        </p>
      </div>
    </footer>
  );
}
