import {getTranslations, setRequestLocale} from 'next-intl/server';
import MatchBreakdown from '@/components/live/MatchBreakdown';
import StandingsTable from '@/components/live/StandingsTable';
import {StatusBadge} from '@/components/ui/badges';
import {Link} from '@/i18n/navigation';
import {getLiveState} from '@/lib/db/queries/live';

// Live data: refresh every minute (the sync-live cron feeds the database).
export const revalidate = 60;

export default async function LivePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('live');

  const live = await getLiveState();

  if (!live) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">{t('noLive')}</h1>
        <p className="mb-6 text-zinc-500 dark:text-zinc-400">{t('noLiveText')}</p>
        <Link
          href="/tournaments"
          className="inline-block rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-accent-400"
        >
          {t('seeCalendar')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <StatusBadge status="ongoing" />
        </div>
        <h1 className="text-2xl font-bold">
          <Link
            href={`/tournaments/${live.tournament.slug}`}
            className="hover:underline"
          >
            {live.tournament.name}
          </Link>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-bold">{t('overallStandings')}</h2>
        <StandingsTable standings={live.standings} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">{t('latestMatches')}</h2>
        <div className="space-y-3">
          {live.matches.map((match, i) => (
            <MatchBreakdown key={match.id} match={match} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('lastUpdated')}</p>
    </div>
  );
}
