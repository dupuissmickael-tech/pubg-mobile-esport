import {Link} from '@/i18n/navigation';
import {RegionBadge} from '@/components/ui/badges';
import TeamLogo from '@/components/ui/TeamLogo';
import type {TeamSummary} from '@/lib/types';

export default function TeamCard({team}: {team: TeamSummary}) {
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-accent-500/50 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <TeamLogo name={team.name} logoUrl={team.logoUrl} size="lg" />
      <div className="min-w-0">
        <h3 className="truncate font-semibold">{team.name}</h3>
        {team.orgName && (
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {team.orgName}
          </p>
        )}
        <div className="mt-1.5">
          <RegionBadge region={team.region} />
        </div>
      </div>
    </Link>
  );
}
