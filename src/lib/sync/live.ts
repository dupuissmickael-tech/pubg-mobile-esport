import {eq, sql} from 'drizzle-orm';
import {getDb} from '@/lib/db';
import {tournaments} from '@/lib/db/schema';

/**
 * Live sync recomputes derived state from the locally stored match results:
 * - overall standings (tournament_teams.total_points / total_kills);
 * - match statuses (scheduled -> live -> completed based on time).
 *
 * Per-match results themselves are ingested from whatever live source is
 * available for a given tournament (official PUBG Mobile esports feed,
 * organizer API, or manual entry through the database). This function is the
 * single place that turns raw results into what the /live page displays, so
 * plugging a new source only means inserting rows into `match_results`.
 */
export async function syncLive(): Promise<{items: number; partial?: boolean}> {
  const db = getDb();

  const ongoing = await db
    .select({id: tournaments.id})
    .from(tournaments)
    .where(eq(tournaments.status, 'ongoing'));

  if (ongoing.length === 0) {
    // Nothing to do outside of tournament days — the job stays cheap.
    return {items: 0};
  }

  // Mark matches live/completed based on their scheduled time. A Battle
  // Royale round rarely exceeds ~40 minutes.
  await db.execute(sql`
    update matches set status = 'live', updated_at = now()
    where status = 'scheduled'
      and scheduled_at <= now()
      and scheduled_at > now() - interval '40 minutes'
  `);
  await db.execute(sql`
    update matches set status = 'completed', updated_at = now()
    where status = 'live'
      and scheduled_at <= now() - interval '40 minutes'
      and exists (select 1 from match_results where match_id = matches.id)
  `);

  // Recompute overall standings from per-match results.
  let items = 0;
  for (const t of ongoing) {
    const result = await db.execute(sql`
      update tournament_teams tt set
        total_points = coalesce(agg.points, 0),
        total_kills = coalesce(agg.kills, 0)
      from (
        select mr.team_id,
               sum(mr.total_points) as points,
               sum(mr.kills) as kills
        from match_results mr
        join matches m on m.id = mr.match_id
        where m.tournament_id = ${t.id}
          and m.status in ('live', 'completed')
        group by mr.team_id
      ) agg
      where tt.tournament_id = ${t.id} and tt.team_id = agg.team_id
    `);
    items += result.count ?? 0;
  }

  return {items};
}
