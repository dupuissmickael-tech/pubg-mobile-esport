import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('common');

  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <p className="mb-2 text-5xl font-black text-accent-500">404</p>
      <h1 className="mb-2 text-xl font-bold">{t('notFound')}</h1>
      <p className="mb-6 text-zinc-500 dark:text-zinc-400">{t('notFoundText')}</p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-accent-400"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
