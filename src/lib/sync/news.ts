import {and, eq, gte, inArray, lte} from 'drizzle-orm';
import {getDb} from '@/lib/db';
import {news, newsTags, tags, tournaments} from '@/lib/db/schema';

/**
 * News sync generates short articles from events observed in the local data
 * (tournament starting today, tournament finished yesterday). This keeps the
 * news feed alive automatically; richer sources (official announcements,
 * organisation feeds) can be added here later — each source only needs to
 * upsert into `news` + `news_tags` with a stable slug for deduplication.
 */

async function ensureTag(slug: string, label: string): Promise<string> {
  const db = getDb();
  const [existing] = await db
    .select({id: tags.id})
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  if (existing) return existing.id;
  const [inserted] = await db
    .insert(tags)
    .values({slug, label})
    .onConflictDoNothing({target: tags.slug})
    .returning({id: tags.id});
  if (inserted) return inserted.id;
  const [row] = await db
    .select({id: tags.id})
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  return row.id;
}

export async function syncNews(): Promise<{items: number; partial?: boolean}> {
  const db = getDb();
  let items = 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);

  const starting = await db
    .select()
    .from(tournaments)
    .where(
      and(eq(tournaments.startDate, today), eq(tournaments.status, 'ongoing'))
    );
  const finished = await db
    .select()
    .from(tournaments)
    .where(
      and(
        gte(tournaments.endDate, yesterday),
        lte(tournaments.endDate, today),
        eq(tournaments.status, 'completed')
      )
    );

  const tournamentTagId = await ensureTag('tournaments', 'Tournaments');
  const resultsTagId = await ensureTag('results', 'Results');

  const candidates: Array<{
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    tagIds: string[];
  }> = [
    ...starting.map((t) => ({
      slug: `${t.slug}-kicks-off`,
      title: `${t.name} kicks off today`,
      excerpt: `${t.name} starts today. Follow the live standings and per-match scores.`,
      body: `${t.name} begins today${t.prizePool ? ` with a $${Number(t.prizePool).toLocaleString('en-US')} prize pool` : ''}. Live standings and match-by-match points are available on the Live page for the whole event.`,
      tagIds: [tournamentTagId]
    })),
    ...finished.map((t) => ({
      slug: `${t.slug}-final-results`,
      title: `${t.name}: final results`,
      excerpt: `${t.name} has concluded. Check the final standings.`,
      body: `${t.name} has wrapped up. The final standings and per-team results are available on the tournament page.`,
      tagIds: [tournamentTagId, resultsTagId]
    }))
  ];

  if (candidates.length === 0) return {items: 0};

  const existing = await db
    .select({slug: news.slug})
    .from(news)
    .where(inArray(news.slug, candidates.map((c) => c.slug)));
  const existingSlugs = new Set(existing.map((e) => e.slug));

  for (const candidate of candidates) {
    if (existingSlugs.has(candidate.slug)) continue;
    const [inserted] = await db
      .insert(news)
      .values({
        slug: candidate.slug,
        title: candidate.title,
        excerpt: candidate.excerpt,
        body: candidate.body,
        sourceName: 'Auto-generated',
        publishedAt: new Date()
      })
      .onConflictDoNothing({target: news.slug})
      .returning({id: news.id});
    if (!inserted) continue;
    for (const tagId of candidate.tagIds) {
      await db
        .insert(newsTags)
        .values({newsId: inserted.id, tagId})
        .onConflictDoNothing();
    }
    items++;
  }

  return {items};
}
