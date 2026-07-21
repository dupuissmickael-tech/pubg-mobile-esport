import {Suspense} from 'react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import TournamentCard from '@/components/tournaments/TournamentCard';
import TournamentFilters from '@/components/tournaments/TournamentFilters';
import {listTournaments} from '@/lib/db/queries/tournaments';
import type {Region, Tier, TournamentStatus} from '@/lib/types';

const REGIONS = new Set(['global', 'asia', 'sea', 'south_asia', 'mena', 'europe', 'na', 'sa']);
const TIERS = new Set(['s', 'a', 'b', 'qualifier']);
const STATUSES = new Set(['upcoming', 'ongoing', 'completed']);

export default async function TournamentsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{region?: string; tier?: string; status?: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('tournaments');
  const sp = await searchParams;

  const tournaments = await listTournaments(
    {
      region: sp.region && REGIONS.has(sp.region) ? (sp.region as Region) : undefined,
      tier: sp.tier && TIERS.has(sp.tier) ? (sp.tier as Tier) : undefined,
      status:
        sp.status && STATUSES.has(sp.status)
          ? (sp.status as TournamentStatus)
          : undefined
    },
    locale
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
      </header>

      <Suspense>
        <TournamentFilters />
      </Suspense>

      {tournaments.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {t('noResults')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
