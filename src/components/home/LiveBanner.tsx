import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {MatchView} from '@/lib/types';

export default async function LiveBanner({match}: {match: MatchView}) {
  const t = await getTranslations('home');

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="live-dot h-2.5 w-2.5 rounded-full bg-red-500" />
        <div>
          <p className="text-xs font-bold tracking-widest text-red-500">
            {t('liveNow')}
          </p>
          <Link
            href={`/tournaments/${match.tournamentSlug}`}
            className="font-semibold hover:underline"
          >
            {match.tournamentName}
            {match.stage ? ` — ${match.stage}` : ''}
            {match.matchNumber ? ` · Match ${match.matchNumber}` : ''}
          </Link>
        </div>
      </div>
      {match.streamUrl && (
        <a
          href={match.streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 sm:mt-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {t('watchStream')}
        </a>
      )}
    </div>
  );
}
