'use client';

import {useEffect, useState} from 'react';
import {useLocale} from 'next-intl';

/**
 * Renders a timestamp in the visitor's own timezone. The server renders a
 * UTC value; the client swaps in the local one after hydration.
 */
export default function LocalTime({
  iso,
  mode = 'datetime'
}: {
  iso: string;
  mode?: 'datetime' | 'time';
}) {
  const locale = useLocale();
  const [text, setText] = useState(() => format(iso, locale, mode, 'UTC'));

  useEffect(() => {
    setText(format(iso, locale, mode));
  }, [iso, locale, mode]);

  return <time dateTime={iso} suppressHydrationWarning>{text}</time>;
}

function format(
  iso: string,
  locale: string,
  mode: 'datetime' | 'time',
  timeZone?: string
) {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions =
    mode === 'time'
      ? {hour: '2-digit', minute: '2-digit', timeZone}
      : {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          timeZone
        };
  return date.toLocaleString(locale, options);
}
