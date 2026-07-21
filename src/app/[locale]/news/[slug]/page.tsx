import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getNewsItem} from '@/lib/db/queries/news';
import {formatDate} from '@/lib/utils';

export const revalidate = 300;

export default async function NewsDetailPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('news');
  const tCommon = await getTranslations('common');

  const item = await getNewsItem(slug, locale);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.tags.map((tag) => (
            <Link
              key={tag}
              href={`/news?tag=${tag}`}
              className="rounded-full bg-accent-500/15 px-2 py-0.5 font-semibold text-accent-600 dark:text-accent-400"
            >
              {t(`tags.${tag}`)}
            </Link>
          ))}
          <span className="text-zinc-500 dark:text-zinc-400">
            {formatDate(item.publishedAt, locale)}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{item.title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">{item.excerpt}</p>
      </header>

      <div className="space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        {item.body.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {item.sourceName && (
        <p className="border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t('source')}:{' '}
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:underline dark:text-accent-400"
            >
              {item.sourceName}
            </a>
          ) : (
            item.sourceName
          )}
        </p>
      )}

      <Link
        href="/news"
        className="inline-block text-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
      >
        ← {tCommon('backTo', {page: t('title')})}
      </Link>
    </article>
  );
}
