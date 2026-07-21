import {getTranslations} from 'next-intl/server';
import LocalTime from '@/components/ui/LocalTime';
import TeamLogo from '@/components/ui/TeamLogo';
import type {MatchWithResults} from '@/lib/types';

/** Per-match points breakdown (kill points + placement points). */
export default async function MatchBreakdown({
  match,
  defaultOpen = false
}: {
  match: MatchWithResults;
  defaultOpen?: boolean;
}) {
  const t = await getTranslations('live');

  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          {match.status === 'live' && (
            <span className="live-dot h-2 w-2 rounded-full bg-red-500" />
          )}
          <span className="font-semibold">
            Match {match.matchNumber} · {match.map}
          </span>
          <span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">
            {match.stage}
          </span>
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          <LocalTime iso={match.scheduledAt} mode="time" />
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-zinc-100 dark:border-zinc-800">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2">{t('placement')}</th>
              <th className="px-4 py-2">{t('team')}</th>
              <th className="px-4 py-2 text-right">{t('kills')}</th>
              <th className="px-4 py-2 text-right">{t('placementPoints')}</th>
              <th className="px-4 py-2 text-right">{t('killPoints')}</th>
              <th className="px-4 py-2 text-right">{t('totalPoints')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {match.results.map((r) => (
              <tr key={r.team.id}>
                <td className="px-4 py-2 tabular-nums">
                  {r.placement === 1 ? (
                    <span title={t('winner')}>🏆</span>
                  ) : (
                    `#${r.placement}`
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className="flex items-center gap-2">
                    <TeamLogo name={r.team.name} logoUrl={r.team.logoUrl} size="sm" />
                    {r.team.name}
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{r.kills}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {r.placementPoints}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {r.killPoints}
                </td>
                <td className="px-4 py-2 text-right font-semibold tabular-nums">
                  {r.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
