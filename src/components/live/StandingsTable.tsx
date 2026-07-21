import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import TeamLogo from '@/components/ui/TeamLogo';
import type {StandingRow} from '@/lib/types';
import {cn} from '@/lib/utils';

export default async function StandingsTable({
  standings
}: {
  standings: StandingRow[];
}) {
  const t = await getTranslations('live');

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[480px] bg-white text-sm dark:bg-zinc-900">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-4 py-3">{t('rank')}</th>
            <th className="px-4 py-3">{t('team')}</th>
            <th className="px-4 py-3 text-right">{t('matchesPlayed')}</th>
            <th className="px-4 py-3 text-right">{t('kills')}</th>
            <th className="px-4 py-3 text-right">{t('points')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {standings.map((row) => (
            <tr
              key={row.team.id}
              className={cn(
                row.rank === 1 && 'bg-accent-500/10',
                row.rank <= 3 && row.rank > 1 && 'bg-accent-500/5'
              )}
            >
              <td className="px-4 py-2.5 font-bold tabular-nums">
                {row.rank}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  href={`/teams/${row.team.slug}`}
                  className="flex items-center gap-2 font-medium hover:underline"
                >
                  <TeamLogo name={row.team.name} logoUrl={row.team.logoUrl} size="sm" />
                  {row.team.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-zinc-500 dark:text-zinc-400">
                {row.matchesPlayed}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {row.totalKills}
              </td>
              <td className="px-4 py-2.5 text-right font-bold tabular-nums text-accent-600 dark:text-accent-400">
                {row.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
