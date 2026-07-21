import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {RegionBadge, StatusBadge, TierBadge} from '@/components/ui/badges';
import type {TournamentSummary} from '@/lib/types';
import {formatDate, formatPrize} from '@/lib/utils';

export default async function TournamentCard({
  tournament
}: {
  tournament: TournamentSummary;
}) {
  const locale = await getLocale();
  const t = await getTranslations('tournaments');

  return (
    <Link
      href={`/tournaments/${tournament.slug}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-accent-500/50 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={tournament.status} />
        <TierBadge tier={tournament.tier} />
        <RegionBadge region={tournament.region} />
      </div>
      <h3 className="mb-1 font-semibold leading-snug">{tournament.name}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {formatDate(tournament.startDate, locale)} –{' '}
        {formatDate(tournament.endDate, locale)}
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-accent-600 dark:text-accent-400">
          {tournament.prizePool
            ? formatPrize(tournament.prizePool, tournament.prizeCurrency, locale)
            : '—'}
        </span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {tournament.teamCount > 0
            ? t('teams', {count: tournament.teamCount})
            : ''}
        </span>
      </div>
    </Link>
  );
}
