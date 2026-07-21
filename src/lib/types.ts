export type Region =
  | 'global'
  | 'asia'
  | 'sea'
  | 'south_asia'
  | 'mena'
  | 'europe'
  | 'na'
  | 'sa';

export type Tier = 's' | 'a' | 'b' | 'qualifier';

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type PlayerRole =
  | 'igl'
  | 'assaulter'
  | 'support'
  | 'sniper'
  | 'scout'
  | 'coach'
  | 'sub';

export interface TeamSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  region: Region;
  orgName: string | null;
}

export interface PlayerView {
  id: string;
  nickname: string;
  realName: string | null;
  role: PlayerRole | null;
  countryCode: string | null;
}

export interface TransferView {
  id: string;
  playerNickname: string;
  fromTeamName: string | null;
  toTeamName: string | null;
  transferDate: string;
}

export interface TeamResultView {
  tournamentSlug: string;
  tournamentName: string;
  endDate: string;
  finalRank: number | null;
  totalPoints: number;
}

export interface TeamDetail extends TeamSummary {
  fullName: string | null;
  roster: PlayerView[];
  recentResults: TeamResultView[];
  transfers: TransferView[];
}

export interface TournamentSummary {
  id: string;
  slug: string;
  name: string;
  tier: Tier;
  region: Region;
  startDate: string;
  endDate: string;
  prizePool: number | null;
  prizeCurrency: string;
  status: TournamentStatus;
  streamUrl: string | null;
  teamCount: number;
}

export interface TournamentTeamRow extends TeamSummary {
  seed: number | null;
  finalRank: number | null;
  totalPoints: number;
  totalKills: number;
}

export interface TournamentDetail extends TournamentSummary {
  format: string | null;
  teams: TournamentTeamRow[];
}

export interface MatchView {
  id: string;
  tournamentId: string;
  tournamentSlug: string;
  tournamentName: string;
  stage: string | null;
  matchNumber: number | null;
  map: string | null;
  scheduledAt: string;
  status: MatchStatus;
  streamUrl: string | null;
}

export interface MatchResultRow {
  team: TeamSummary;
  placement: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

export interface MatchWithResults extends MatchView {
  results: MatchResultRow[];
}

export interface StandingRow {
  rank: number;
  team: TeamSummary;
  matchesPlayed: number;
  totalKills: number;
  totalPoints: number;
}

export interface LiveState {
  tournament: TournamentSummary;
  standings: StandingRow[];
  matches: MatchWithResults[];
}

export interface NewsItemView {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  publishedAt: string;
  tags: string[];
}

export interface SyncLogView {
  id: number;
  job: string;
  status: 'success' | 'partial' | 'error';
  itemsUpserted: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface TranslationRow {
  entityType: string;
  entityId: string;
  field: string;
  locale: string;
  value: string;
}
