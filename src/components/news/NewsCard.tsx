import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {NewsItemView} from '@/lib/types';
import {formatDate} from '@/lib/utils';

export default async function NewsCard({item}: {item: NewsItemView}) {
  const locale = await getLocale();
  const t = await getTranslations('news');

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-accent-500/50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        {item.tags.map((tag) => (
          <Link
            key={tag}
            href={`/news?tag=${tag}`}
            className="rounded-full bg-accent-500/15 px-2 py-0.5 font-semibold text-accent-600 hover:bg-accent-500/25 dark:text-accent-400"
          >
            {t(`tags.${tag}`)}
          </Link>
        ))}
        <span className="text-zinc-500 dark:text-zinc-400">
          {formatDate(item.publishedAt, locale)}
        </span>
      </div>
      <h3 className="mb-1 font-semibold leading-snug">
        <Link href={`/news/${item.slug}`} className="hover:underline">
          {item.title}
        </Link>
      </h3>
      <p className="mb-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
        {item.excerpt}
      </p>
      <Link
        href={`/news/${item.slug}`}
        className="mt-auto text-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
      >
        {t('readMore')} →
      </Link>
    </article>
  );
}
