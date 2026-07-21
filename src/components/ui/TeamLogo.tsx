import {cn} from '@/lib/utils';

const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl'
} as const;

/**
 * Team logo with an initials fallback when no image is available.
 * Real logos (WebP/SVG synced from official sources) are lazy-loaded.
 */
export default function TeamLogo({
  name,
  logoUrl,
  size = 'md'
}: {
  name: string;
  logoUrl: string | null;
  size?: keyof typeof SIZES;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        loading="lazy"
        className={cn('shrink-0 rounded-md object-contain', SIZES[size])}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-zinc-300 font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        SIZES[size]
      )}
    >
      {initials}
    </span>
  );
}
