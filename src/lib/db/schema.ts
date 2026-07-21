import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  bigserial
} from 'drizzle-orm/pg-core';

export const regionEnum = pgEnum('region', [
  'global',
  'asia',
  'sea',
  'south_asia',
  'mena',
  'europe',
  'na',
  'sa'
]);

export const playerRoleEnum = pgEnum('player_role', [
  'igl',
  'assaulter',
  'support',
  'sniper',
  'scout',
  'coach',
  'sub'
]);

export const tierEnum = pgEnum('tier', ['s', 'a', 'b', 'qualifier']);

export const tournamentStatusEnum = pgEnum('tournament_status', [
  'upcoming',
  'ongoing',
  'completed'
]);

export const matchStatusEnum = pgEnum('match_status', [
  'scheduled',
  'live',
  'completed',
  'cancelled'
]);

export const syncStatusEnum = pgEnum('sync_status', [
  'success',
  'partial',
  'error'
]);

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  fullName: text('full_name'),
  logoUrl: text('logo_url'),
  region: regionEnum('region').notNull().default('global'),
  orgName: text('org_name'),
  liquipediaPage: text('liquipedia_page').unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true})
    .notNull()
    .defaultNow()
});

export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id, {onDelete: 'set null'}),
  nickname: text('nickname').notNull(),
  realName: text('real_name'),
  role: playerRoleEnum('role'),
  countryCode: text('country_code'),
  liquipediaPage: text('liquipedia_page').unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true})
    .notNull()
    .defaultNow()
});

export const tournaments = pgTable('tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  tier: tierEnum('tier').notNull().default('b'),
  region: regionEnum('region').notNull().default('global'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  prizePool: numeric('prize_pool'),
  prizeCurrency: text('prize_currency').notNull().default('USD'),
  format: text('format'),
  status: tournamentStatusEnum('status').notNull().default('upcoming'),
  streamUrl: text('stream_url'),
  bracketData: jsonb('bracket_data'),
  liquipediaPage: text('liquipedia_page').unique(),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true})
    .notNull()
    .defaultNow()
});

export const tournamentTeams = pgTable(
  'tournament_teams',
  {
    tournamentId: uuid('tournament_id')
      .notNull()
      .references(() => tournaments.id, {onDelete: 'cascade'}),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, {onDelete: 'cascade'}),
    seed: integer('seed'),
    finalRank: integer('final_rank'),
    totalPoints: integer('total_points').notNull().default(0),
    totalKills: integer('total_kills').notNull().default(0)
  },
  (table) => [primaryKey({columns: [table.tournamentId, table.teamId]})]
);

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournamentId: uuid('tournament_id')
    .notNull()
    .references(() => tournaments.id, {onDelete: 'cascade'}),
  stage: text('stage'),
  matchNumber: integer('match_number'),
  map: text('map'),
  scheduledAt: timestamp('scheduled_at', {withTimezone: true}).notNull(),
  status: matchStatusEnum('status').notNull().default('scheduled'),
  streamUrl: text('stream_url'),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true})
    .notNull()
    .defaultNow()
});

export const matchResults = pgTable(
  'match_results',
  {
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id, {onDelete: 'cascade'}),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, {onDelete: 'cascade'}),
    placement: integer('placement').notNull(),
    kills: integer('kills').notNull().default(0),
    placementPoints: integer('placement_points').notNull().default(0),
    killPoints: integer('kill_points').notNull().default(0),
    totalPoints: integer('total_points').notNull().default(0)
  },
  (table) => [primaryKey({columns: [table.matchId, table.teamId]})]
);

export const transfers = pgTable('transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id')
    .notNull()
    .references(() => players.id, {onDelete: 'cascade'}),
  fromTeamId: uuid('from_team_id').references(() => teams.id, {
    onDelete: 'set null'
  }),
  toTeamId: uuid('to_team_id').references(() => teams.id, {
    onDelete: 'set null'
  }),
  transferDate: date('transfer_date').notNull(),
  sourceUrl: text('source_url')
});

export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  body: text('body').notNull(),
  coverUrl: text('cover_url'),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  publishedAt: timestamp('published_at', {withTimezone: true}).notNull(),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true})
    .notNull()
    .defaultNow()
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull()
});

export const newsTags = pgTable(
  'news_tags',
  {
    newsId: uuid('news_id')
      .notNull()
      .references(() => news.id, {onDelete: 'cascade'}),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, {onDelete: 'cascade'})
  },
  (table) => [primaryKey({columns: [table.newsId, table.tagId]})]
);

// Data-level translations (interface strings live in src/messages/*.json).
export const translations = pgTable(
  'translations',
  {
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    field: text('field').notNull(),
    locale: text('locale').notNull(),
    value: text('value').notNull()
  },
  (table) => [
    primaryKey({
      columns: [table.entityType, table.entityId, table.field, table.locale]
    })
  ]
);

export const syncLogs = pgTable('sync_logs', {
  id: bigserial('id', {mode: 'number'}).primaryKey(),
  job: text('job').notNull(),
  status: syncStatusEnum('status').notNull(),
  itemsUpserted: integer('items_upserted').notNull().default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', {withTimezone: true}).notNull(),
  finishedAt: timestamp('finished_at', {withTimezone: true})
});
