import {useTranslations} from 'next-intl';
import type {Region, Tier, TournamentStatus} from '@/lib/types';
import {cn} from '@/lib/utils';

const badgeBase =
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';

export function TierBadge({tier}: {tier: Tier}) {
  const t = useTranslations('tournaments');
  const styles: Record<Tier, string> = {
    s: 'bg-accent-500/15 text-accent-600 dark:text-accent-400',
    a: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    b: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
    qualifier: 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
  };
  return (
    <span className={cn(badgeBase, styles[tier])}>
      {tier === 'qualifier' ? t('qualifier') : t('tier', {tier: tier.toUpperCase()})}
    </span>
  );
}

export function StatusBadge({status}: {status: TournamentStatus}) {
  const t = useTranslations('tournaments.status');
  const styles: Record<TournamentStatus, string> = {
    upcoming: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    ongoing: 'bg-red-500/15 text-red-600 dark:text-red-400',
    completed: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400'
  };
  return (
    <span className={cn(badgeBase, styles[status])}>
      {status === 'ongoing' && (
        <span className="live-dot mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
      )}
      {t(status)}
    </span>
  );
}

export function RegionBadge({region}: {region: Region}) {
  const t = useTranslations('regions');
  return (
    <span className={cn(badgeBase, 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400')}>
      {t(region)}
    </span>
  );
}
