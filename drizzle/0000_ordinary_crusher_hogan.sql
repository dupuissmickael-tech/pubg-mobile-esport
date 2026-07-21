CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."player_role" AS ENUM('igl', 'assaulter', 'support', 'sniper', 'scout', 'coach', 'sub');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('global', 'asia', 'sea', 'south_asia', 'mena', 'europe', 'na', 'sa');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('success', 'partial', 'error');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('s', 'a', 'b', 'qualifier');--> statement-breakpoint
CREATE TYPE "public"."tournament_status" AS ENUM('upcoming', 'ongoing', 'completed');--> statement-breakpoint
CREATE TABLE "match_results" (
	"match_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"placement" integer NOT NULL,
	"kills" integer DEFAULT 0 NOT NULL,
	"placement_points" integer DEFAULT 0 NOT NULL,
	"kill_points" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "match_results_match_id_team_id_pk" PRIMARY KEY("match_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"stage" text,
	"match_number" integer,
	"map" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"stream_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"cover_url" text,
	"source_name" text,
	"source_url" text,
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_tags" (
	"news_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "news_tags_news_id_tag_id_pk" PRIMARY KEY("news_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid,
	"nickname" text NOT NULL,
	"real_name" text,
	"role" "player_role",
	"country_code" text,
	"liquipedia_page" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_liquipedia_page_unique" UNIQUE("liquipedia_page")
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job" text NOT NULL,
	"status" "sync_status" NOT NULL,
	"items_upserted" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"full_name" text,
	"logo_url" text,
	"region" "region" DEFAULT 'global' NOT NULL,
	"org_name" text,
	"liquipedia_page" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug"),
	CONSTRAINT "teams_liquipedia_page_unique" UNIQUE("liquipedia_page")
);
--> statement-breakpoint
CREATE TABLE "tournament_teams" (
	"tournament_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"seed" integer,
	"final_rank" integer,
	"total_points" integer DEFAULT 0 NOT NULL,
	"total_kills" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tournament_teams_tournament_id_team_id_pk" PRIMARY KEY("tournament_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tier" "tier" DEFAULT 'b' NOT NULL,
	"region" "region" DEFAULT 'global' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"prize_pool" numeric,
	"prize_currency" text DEFAULT 'USD' NOT NULL,
	"format" text,
	"status" "tournament_status" DEFAULT 'upcoming' NOT NULL,
	"stream_url" text,
	"bracket_data" jsonb,
	"liquipedia_page" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tournaments_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tournaments_liquipedia_page_unique" UNIQUE("liquipedia_page")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"from_team_id" uuid,
	"to_team_id" uuid,
	"transfer_date" date NOT NULL,
	"source_url" text
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"field" text NOT NULL,
	"locale" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "translations_entity_type_entity_id_field_locale_pk" PRIMARY KEY("entity_type","entity_id","field","locale")
);
--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_team_id_teams_id_fk" FOREIGN KEY ("from_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_team_id_teams_id_fk" FOREIGN KEY ("to_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;