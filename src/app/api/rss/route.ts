import {listNews} from '@/lib/db/queries/news';

export const revalidate = 1800;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Internal RSS feed of the news section, for automation and readers. */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const items = await listNews('en', undefined, 30);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PMEsport Hub — PUBG Mobile Esports News</title>
    <link>${siteUrl}</link>
    <description>Tournaments, transfers, results and patch notes from the PUBG Mobile competitive scene.</description>
    <language>en</language>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${siteUrl}/en/news/${item.slug}</link>
      <guid isPermaLink="true">${siteUrl}/en/news/${item.slug}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(item.excerpt)}</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {'Content-Type': 'application/rss+xml; charset=utf-8'}
  });
}
