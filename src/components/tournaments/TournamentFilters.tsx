'use client';

import {useCallback} from 'react';
import {useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';

const REGIONS = ['global', 'asia', 'sea', 'south_asia', 'mena', 'europe', 'na', 'sa'];
const TIERS = ['s', 'a', 'b', 'qualifier'];
const STATUSES = ['upcoming', 'ongoing', 'completed'];

function Select({
  label,
  value,
  options,
  labels,
  allLabel,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  labels: (option: string) => string;
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function TournamentFilters() {
  const t = useTranslations('tournaments');
  const tRegions = useTranslations('regions');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}` as never, {
        scroll: false
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Select
        label={t('filterRegion')}
        value={searchParams.get('region') ?? ''}
        options={REGIONS}
        labels={(o) => tRegions(o)}
        allLabel={t('all')}
        onChange={(v) => setParam('region', v)}
      />
      <Select
        label={t('filterTier')}
        value={searchParams.get('tier') ?? ''}
        options={TIERS}
        labels={(o) =>
          o === 'qualifier' ? t('qualifier') : t('tier', {tier: o.toUpperCase()})
        }
        allLabel={t('all')}
        onChange={(v) => setParam('tier', v)}
      />
      <Select
        label={t('filterStatus')}
        value={searchParams.get('status') ?? ''}
        options={STATUSES}
        labels={(o) => t(`status.${o}`)}
        allLabel={t('all')}
        onChange={(v) => setParam('status', v)}
      />
    </div>
  );
}
