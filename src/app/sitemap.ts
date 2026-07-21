import type {MetadataRoute} from 'next';
import {listNews} from '@/lib/db/queries/news';
import {listTeams} from '@/lib/db/queries/teams';
import {listTournaments} from '@/lib/db/queries/tournaments';
import {routing} from '@/i18n/routing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const [tournaments, teams, news] = await Promise.all([
    listTournaments({}, 'en'),
    listTeams(),
    listNews('en')
  ]);

  const staticPaths = ['', '/tournaments', '/live', '/news', '/teams'];
  const dynamicPaths = [
    ...tournaments.map((t) => `/tournaments/${t.slug}`),
    ...teams.map((t) => `/teams/${t.slug}`),
    ...news.map((n) => `/news/${n.slug}`)
  ];

  return routing.locales.flatMap((locale) =>
    [...staticPaths, ...dynamicPaths].map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: 'hourly' as const
    }))
  );
}
