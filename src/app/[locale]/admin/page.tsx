import {getLocale, getTranslations, setRequestLocale} from 'next-intl/server';
import AdminPanel from '@/components/admin/AdminPanel';
import {listSyncLogs} from '@/lib/db/queries/logs';
import {cn} from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const activeLocale = await getLocale();

  const logs = await listSyncLogs();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
      </header>

      <AdminPanel />

      <section>
        <h2 className="mb-4 text-lg font-bold">{t('syncLogs')}</h2>
        {logs.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {t('noLogs')}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[560px] bg-white text-sm dark:bg-zinc-900">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-4 py-3">{t('job')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3 text-right">{t('items')}</th>
                  <th className="px-4 py-3">{t('startedAt')}</th>
                  <th className="px-4 py-3">{t('error')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2.5 font-medium">{log.job}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                          log.status === 'success' &&
                            'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                          log.status === 'partial' &&
                            'bg-accent-500/15 text-accent-600 dark:text-accent-400',
                          log.status === 'error' &&
                            'bg-red-500/15 text-red-600 dark:text-red-400'
                        )}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {log.itemsUpserted}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                      {new Date(log.startedAt).toLocaleString(activeLocale, {
                        timeZone: 'UTC'
                      })}{' '}
                      UTC
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-2.5 text-red-500">
                      {log.errorMessage ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
