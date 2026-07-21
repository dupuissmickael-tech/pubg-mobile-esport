import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {RegionBadge} from '@/components/ui/badges';
import TeamLogo from '@/components/ui/TeamLogo';
import {Link} from '@/i18n/navigation';
import {getTeamDetail} from '@/lib/db/queries/teams';
import {countryFlag, formatDate} from '@/lib/utils';

export const revalidate = 300;

export default async function TeamDetailPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('teams');
  const tRoles = await getTranslations('roles');

  const team = await getTeamDetail(slug);
  if (!team) notFound();

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-5">
        <TeamLogo name={team.name} logoUrl={team.logoUrl} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.fullName && (
            <p className="text-zinc-500 dark:text-zinc-400">{team.fullName}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <RegionBadge region={team.region} />
            {team.orgName && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {t('organization')}: {team.orgName}
              </span>
            )}
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-bold">{t('roster')}</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[420px] bg-white text-sm dark:bg-zinc-900">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3">{t('player')}</th>
                <th className="px-4 py-3">{t('role')}</th>
                <th className="px-4 py-3">{t('country')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {team.roster.map((player) => (
                <tr key={player.id}>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold">{player.nickname}</span>
                    {player.realName && (
                      <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                        {player.realName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {player.role ? tRoles(player.role) : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    {player.countryCode
                      ? `${countryFlag(player.countryCode)} ${player.countryCode}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">{t('recentResults')}</h2>
        {team.recentResults.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {t('noResults')}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {team.recentResults.map((result) => (
              <li
                key={result.tournamentSlug}
                className="flex items-center justify-between gap-4 bg-white p-4 dark:bg-zinc-900"
              >
                <div className="min-w-0">
                  <Link
                    href={`/tournaments/${result.tournamentSlug}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {result.tournamentName}
                  </Link>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(result.endDate, locale)}
                  </p>
                </div>
                <span className="shrink-0 font-bold tabular-nums">
                  {result.finalRank ? `#${result.finalRank}` : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">{t('transfers')}</h2>
        {team.transfers.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {t('noTransfers')}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {team.transfers.map((transfer) => (
              <li
                key={transfer.id}
                className="flex items-center justify-between gap-4 bg-white p-4 text-sm dark:bg-zinc-900"
              >
                <span>
                  <span className="font-semibold">{transfer.playerNickname}</span>{' '}
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {transfer.fromTeamName ?? t('freeAgent')} →{' '}
                    {transfer.toTeamName ?? t('inactive')}
                  </span>
                </span>
                <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                  {formatDate(transfer.transferDate, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
