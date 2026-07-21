import {getTranslations, setRequestLocale} from 'next-intl/server';
import LiveBanner from '@/components/home/LiveBanner';
import MatchList from '@/components/home/MatchList';
import NewsCard from '@/components/news/NewsCard';
import TournamentCard from '@/components/tournaments/TournamentCard';
import {Link} from '@/i18n/navigation';
import {getLiveMatch, getUpcomingMatches} from '@/lib/db/queries/live';
import {listNews} from '@/lib/db/queries/news';
import {getOngoingTournaments} from '@/lib/db/queries/tournaments';

// Home mixes live data with news: short revalidation window.
export const revalidate = 60;

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const [liveMatch, upcoming, latestNews, ongoing] = await Promise.all([
    getLiveMatch(),
    getUpcomingMatches(),
    listNews(locale, undefined, 4),
    getOngoingTournaments()
  ]);

  return (
    <div className="space-y-10">
      {liveMatch && <LiveBanner match={liveMatch} />}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('next48h')}</h2>
          <Link
            href="/tournaments"
            className="text-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
          >
            {t('fullCalendar')} →
          </Link>
        </div>
        <MatchList matches={upcoming} />
      </section>

      {ongoing.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">{t('ongoingTournaments')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ongoing.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('latestNews')}</h2>
          <Link
            href="/news"
            className="text-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
          >
            {t('allNews')} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {latestNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
