import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Countdown from '@/components/tournaments/Countdown';
import {RegionBadge, StatusBadge, TierBadge} from '@/components/ui/badges';
import TeamLogo from '@/components/ui/TeamLogo';
import {Link} from '@/i18n/navigation';
import {getTournamentDetail} from '@/lib/db/queries/tournaments';
import {formatDate, formatPrize} from '@/lib/utils';

export const revalidate = 300;

export default async function TournamentDetailPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('tournaments');

  const tournament = await getTournamentDetail(slug, locale);
  if (!tournament) notFound();

  const showStandings =
    tournament.status !== 'upcoming' &&
    tournament.teams.some((team) => team.totalPoints > 0 || team.finalRank);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={tournament.status} />
          <TierBadge tier={tournament.tier} />
          <RegionBadge region={tournament.region} />
        </div>
        <h1 className="text-2xl font-bold">{tournament.name}</h1>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t('dates')}</dt>
            <dd className="font-medium">
              {formatDate(tournament.startDate, locale)} –{' '}
              {formatDate(tournament.endDate, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t('prizePool')}</dt>
            <dd className="font-medium text-accent-600 dark:text-accent-400">
              {tournament.prizePool
                ? formatPrize(tournament.prizePool, tournament.prizeCurrency, locale)
                : '—'}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-zinc-500 dark:text-zinc-400">{t('format')}</dt>
            <dd className="font-medium">{tournament.format ?? '—'}</dd>
          </div>
        </dl>
        {tournament.streamUrl && tournament.status !== 'completed' && (
          <a
            href={tournament.streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-accent-400"
          >
            {t('watchStream')}
          </a>
        )}
      </header>

      {tournament.status === 'upcoming' && (
        <Countdown startDate={tournament.startDate} />
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">
          {showStandings ? t('results') : t('qualifiedTeams')}
        </h2>
        {tournament.teams.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {t('noTeamsYet')}
          </p>
        ) : showStandings ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[420px] bg-white text-sm dark:bg-zinc-900">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-4 py-3">{t('finalRank')}</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3 text-right">Kills</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tournament.teams.map((team, i) => (
                  <tr key={team.id}>
                    <td className="px-4 py-2.5 font-bold tabular-nums">
                      {team.finalRank ?? i + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/teams/${team.slug}`}
                        className="flex items-center gap-2 font-medium hover:underline"
                      >
                        <TeamLogo name={team.name} logoUrl={team.logoUrl} size="sm" />
                        {team.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {team.totalKills}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {team.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tournament.teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.slug}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-accent-500/50 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <TeamLogo name={team.name} logoUrl={team.logoUrl} size="md" />
                <span className="truncate font-medium">{team.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
