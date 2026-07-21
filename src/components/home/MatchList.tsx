import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import LocalTime from '@/components/ui/LocalTime';
import type {MatchView} from '@/lib/types';

export default async function MatchList({matches}: {matches: MatchView[]}) {
  const t = await getTranslations('home');

  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {t('noUpcoming')}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {matches.map((match) => (
        <li
          key={match.id}
          className="flex items-center justify-between gap-4 bg-white p-4 dark:bg-zinc-900"
        >
          <div className="min-w-0">
            <Link
              href={`/tournaments/${match.tournamentSlug}`}
              className="block truncate font-medium hover:underline"
            >
              {match.tournamentName}
            </Link>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {[match.stage, match.matchNumber ? `Match ${match.matchNumber}` : null, match.map]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm">
            {match.status === 'live' ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-red-500">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
                LIVE
              </span>
            ) : (
              <span className="text-zinc-600 dark:text-zinc-300">
                <LocalTime iso={match.scheduledAt} />
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
