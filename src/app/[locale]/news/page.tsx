import {getTranslations, setRequestLocale} from 'next-intl/server';
import NewsCard from '@/components/news/NewsCard';
import {Link} from '@/i18n/navigation';
import {KNOWN_TAGS, listNews} from '@/lib/db/queries/news';
import {cn} from '@/lib/utils';

export default async function NewsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{tag?: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('news');
  const {tag} = await searchParams;
  const activeTag = tag && (KNOWN_TAGS as readonly string[]).includes(tag) ? tag : undefined;

  const items = await listNews(locale, activeTag);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/news"
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium transition',
            !activeTag
              ? 'bg-accent-500 text-zinc-950'
              : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          {t('all')}
        </Link>
        {KNOWN_TAGS.map((slug) => (
          <Link
            key={slug}
            href={`/news?tag=${slug}`}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition',
              activeTag === slug
                ? 'bg-accent-500 text-zinc-950'
                : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
            )}
          >
            {t(`tags.${slug}`)}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t('empty')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
