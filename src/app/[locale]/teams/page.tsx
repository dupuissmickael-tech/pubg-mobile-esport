import {getTranslations, setRequestLocale} from 'next-intl/server';
import TeamCard from '@/components/teams/TeamCard';
import {listTeams} from '@/lib/db/queries/teams';

export const revalidate = 300;

export default async function TeamsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('teams');

  const teams = await listTeams();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
