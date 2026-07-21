import {desc, eq, inArray} from 'drizzle-orm';
import {getDb, hasDatabase} from '..';
import {news, newsTags, tags} from '../schema';
import {demoNews} from '@/lib/demo-data';
import type {NewsItemView} from '@/lib/types';
import {applyTranslation, loadTranslations} from './translate';

export const KNOWN_TAGS = [
  'transfers',
  'results',
  'tournaments',
  'patch-notes'
] as const;

async function attachTags(items: NewsItemView[]): Promise<NewsItemView[]> {
  if (!hasDatabase() || items.length === 0) return items;
  const db = getDb();
  const rows = await db
    .select({newsId: newsTags.newsId, tagSlug: tags.slug})
    .from(newsTags)
    .innerJoin(tags, eq(newsTags.tagId, tags.id))
    .where(inArray(newsTags.newsId, items.map((n) => n.id)));
  const byNews = new Map<string, string[]>();
  for (const row of rows) {
    const list = byNews.get(row.newsId) ?? [];
    list.push(row.tagSlug);
    byNews.set(row.newsId, list);
  }
  return items.map((n) => ({...n, tags: byNews.get(n.id) ?? []}));
}

export async function listNews(
  locale: string,
  tagSlug?: string,
  limit = 50
): Promise<NewsItemView[]> {
  let items: NewsItemView[];

  if (!hasDatabase()) {
    items = demoNews();
  } else {
    const db = getDb();
    const rows = await db
      .select()
      .from(news)
      .orderBy(desc(news.publishedAt))
      .limit(limit);
    items = await attachTags(
      rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        body: r.body,
        coverUrl: r.coverUrl,
        sourceName: r.sourceName,
        sourceUrl: r.sourceUrl,
        publishedAt: r.publishedAt.toISOString(),
        tags: []
      }))
    );
  }

  if (tagSlug) {
    items = items.filter((n) => n.tags.includes(tagSlug));
  }
  items = items
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);

  const translated = await loadTranslations(
    'news',
    items.map((n) => n.id),
    locale
  );
  return items.map((n) =>
    applyTranslation(n, translated, ['title', 'excerpt', 'body'])
  );
}

export async function getNewsItem(
  slug: string,
  locale: string
): Promise<NewsItemView | null> {
  let item: NewsItemView | undefined;

  if (!hasDatabase()) {
    item = demoNews().find((n) => n.slug === slug);
  } else {
    const db = getDb();
    const [row] = await db
      .select()
      .from(news)
      .where(eq(news.slug, slug))
      .limit(1);
    if (row) {
      [item] = await attachTags([
        {
          id: row.id,
          slug: row.slug,
          title: row.title,
          excerpt: row.excerpt,
          body: row.body,
          coverUrl: row.coverUrl,
          sourceName: row.sourceName,
          sourceUrl: row.sourceUrl,
          publishedAt: row.publishedAt.toISOString(),
          tags: []
        }
      ]);
    }
  }

  if (!item) return null;
  const translated = await loadTranslations('news', [item.id], locale);
  return applyTranslation(item, translated, ['title', 'excerpt', 'body']);
}
