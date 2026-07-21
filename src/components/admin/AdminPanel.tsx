'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';

const JOBS = ['tournaments', 'teams', 'live', 'news'] as const;

export default function AdminPanel() {
  const t = useTranslations('admin');
  const [token, setToken] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function runJob(job: string) {
    setRunning(job);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({job})
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(`${t('failed')}: ${data.error ?? res.status}`);
      } else if (data.status === 'error') {
        setFeedback(`${t('failed')}: ${data.errorMessage ?? ''}`);
      } else {
        setFeedback(
          `${t('success')} — ${job}: ${data.itemsUpserted} items (${data.status})`
        );
      }
    } catch (error) {
      setFeedback(`${t('failed')}: ${String(error)}`);
    } finally {
      setRunning(null);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 font-semibold">{t('forceSync')}</h2>
      <label className="mb-4 block text-sm">
        <span className="mb-1 block font-medium text-zinc-600 dark:text-zinc-400">
          {t('tokenLabel')}
        </span>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t('tokenPlaceholder')}
          className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {JOBS.map((job) => (
          <button
            key={job}
            type="button"
            disabled={!token || running !== null}
            onClick={() => runJob(job)}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running === job ? t('running') : `${t('runJob')} · ${t(`jobs.${job}`)}`}
          </button>
        ))}
      </div>
      {feedback && (
        <p className="mt-4 rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
          {feedback}
        </p>
      )}
    </section>
  );
}
