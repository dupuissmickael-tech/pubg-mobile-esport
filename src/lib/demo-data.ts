import type {
  LiveState,
  MatchWithResults,
  NewsItemView,
  PlayerView,
  StandingRow,
  TeamDetail,
  TeamSummary,
  TournamentDetail,
  TournamentSummary,
  TransferView,
  TranslationRow
} from './types';

/**
 * Built-in sample dataset used when DATABASE_URL is not configured.
 * Dates are computed relative to "now" so the home page always shows a live
 * match, upcoming matches within 48h and a countdown — convenient for local
 * development and demos. Once a real database is seeded and synced from
 * Liquipedia, none of this is used.
 */

const HOUR = 3600_000;
const DAY = 24 * HOUR;

const now = () => Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

const team = (
  id: string,
  slug: string,
  name: string,
  region: TeamSummary['region'],
  orgName: string
): TeamSummary => ({id, slug, name, logoUrl: null, region, orgName});

export const demoTeams: TeamSummary[] = [
  team('t1', 'nova-esports', 'Nova Esports', 'asia', 'Nova Guild'),
  team('t2', 'four-angry-men', '4AM', 'asia', 'Four Angry Men'),
  team('t3', 'alpha7-esports', 'Alpha7 Esports', 'sa', 'Alpha7'),
  team('t4', 'ihc-esports', 'IHC Esports', 'asia', 'IHC'),
  team('t5', 'vampire-esports', 'Vampire Esports', 'sea', 'Vampire'),
  team('t6', 'stalwart-esports', 'Stalwart Esports', 'south_asia', 'Stalwart'),
  team('t7', 'team-falcons', 'Team Falcons', 'mena', 'Falcons'),
  team('t8', 's2g-esports', 'S2G Esports', 'europe', 'S2G')
];

const roster = (
  entries: Array<
    [string, string, PlayerView['role'], string] // nickname, real name, role, country
  >
): PlayerView[] =>
  entries.map(([nickname, realName, role, countryCode], i) => ({
    id: `${nickname}-${i}`,
    nickname,
    realName,
    role,
    countryCode
  }));

const demoRosters: Record<string, PlayerView[]> = {
  't1': roster([
    ['Order', 'Liu Yang', 'igl', 'CN'],
    ['Paraboy', 'Zhu Bocheng', 'assaulter', 'CN'],
    ['Jimmy', 'Wang Cheng', 'sniper', 'CN'],
    ['Coolboy', 'Hu Zhikang', 'support', 'CN'],
    ['Spring', 'Li Chun', 'scout', 'CN']
  ]),
  't2': roster([
    ['33Svan', 'Sun Wen', 'igl', 'CN'],
    ['Suki', 'Chen Hao', 'assaulter', 'CN'],
    ['QuQu', 'Zhao Lei', 'support', 'CN'],
    ['Dream', 'Ma Jun', 'sniper', 'CN']
  ]),
  't3': roster([
    ['Carrilho', 'Matheus Carrilho', 'igl', 'BR'],
    ['Zkrakeen', 'Luis Felipe', 'assaulter', 'BR'],
    ['Ratao', 'Gabriel Souza', 'support', 'BR'],
    ['Zmartinez', 'Julio Martinez', 'sniper', 'BR']
  ]),
  't4': roster([
    ['TOP', 'Enkh-Erdene', 'igl', 'MN'],
    ['Ace', 'Bat-Erdene', 'assaulter', 'MN'],
    ['Nika', 'Tuguldur', 'support', 'MN'],
    ['Dora', 'Munkhbat', 'sniper', 'MN']
  ]),
  't5': roster([
    ['Fluke', 'Thanawat', 'igl', 'TH'],
    ['Boomz', 'Chaiyapat', 'assaulter', 'TH'],
    ['Kratae', 'Sarawut', 'support', 'TH'],
    ['Aviser', 'Natthapon', 'sniper', 'TH']
  ]),
  't6': roster([
    ['Sensei', 'Rohan Thapa', 'igl', 'NP'],
    ['Ninja', 'Sujan Rai', 'assaulter', 'NP'],
    ['Kaos', 'Bibek Gurung', 'support', 'NP'],
    ['Ghost', 'Anil Shrestha', 'sniper', 'NP']
  ]),
  't7': roster([
    ['iShakeR', 'Abdullah Alghamdi', 'igl', 'SA'],
    ['Nass', 'Nasser Alotaibi', 'assaulter', 'SA'],
    ['Rakan', 'Rakan Alharbi', 'support', 'SA'],
    ['Faisal', 'Faisal Alqahtani', 'sniper', 'SA']
  ]),
  't8': roster([
    ['Feanor', 'Emre Yilmaz', 'igl', 'TR'],
    ['Rehoto', 'Kaan Demir', 'assaulter', 'TR'],
    ['Casper', 'Baran Aksoy', 'support', 'TR'],
    ['Aeriaa', 'Mert Kaya', 'sniper', 'TR']
  ])
};

function tournamentBase(
  id: string,
  slug: string,
  name: string,
  tier: TournamentSummary['tier'],
  region: TournamentSummary['region'],
  startMs: number,
  endMs: number,
  prizePool: number | null,
  status: TournamentSummary['status'],
  streamUrl: string | null,
  teamCount: number
): TournamentSummary {
  return {
    id,
    slug,
    name,
    tier,
    region,
    startDate: isoDate(startMs),
    endDate: isoDate(endMs),
    prizePool,
    prizeCurrency: 'USD',
    status,
    streamUrl,
    teamCount
  };
}

export function demoTournaments(): TournamentSummary[] {
  const n = now();
  return [
    tournamentBase(
      'tr1',
      'pmwc-2026',
      'PUBG Mobile World Cup 2026',
      's',
      'global',
      n - 2 * DAY,
      n + 5 * DAY,
      3_000_000,
      'ongoing',
      'https://www.youtube.com/@PUBGMOBILEEsports',
      8
    ),
    tournamentBase(
      'tr2',
      'pmgc-2026',
      'PUBG Mobile Global Championship 2026',
      's',
      'global',
      n + 40 * DAY,
      n + 55 * DAY,
      3_500_000,
      'upcoming',
      'https://www.youtube.com/@PUBGMOBILEEsports',
      8
    ),
    tournamentBase(
      'tr3',
      'pmsl-emea-fall-2026',
      'PMSL EMEA Fall 2026',
      'a',
      'mena',
      n + 12 * DAY,
      n + 30 * DAY,
      300_000,
      'upcoming',
      'https://www.twitch.tv/pubgmobile',
      4
    ),
    tournamentBase(
      'tr4',
      'pmsl-sea-spring-2026',
      'PMSL SEA Spring 2026',
      'a',
      'sea',
      n - 80 * DAY,
      n - 60 * DAY,
      300_000,
      'completed',
      null,
      4
    ),
    tournamentBase(
      'tr5',
      'pmnc-turkiye-2026',
      'PMNC Türkiye 2026 Qualifier',
      'qualifier',
      'europe',
      n - 20 * DAY,
      n - 15 * DAY,
      25_000,
      'completed',
      null,
      4
    )
  ];
}

// SUPER standard placement points, 1 point per kill.
const PLACEMENT_POINTS = [10, 6, 5, 4, 3, 2, 1, 1];

// Deterministic pseudo-random source so the demo standings are stable.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MAPS = ['Erangel', 'Miramar', 'Sanhok', 'Erangel', 'Vikendi'];

function buildMatch(
  id: string,
  tournament: TournamentSummary,
  matchNumber: number,
  scheduledMs: number,
  status: MatchWithResults['status'],
  stage: string
): MatchWithResults {
  const rand = mulberry32(matchNumber * 7919);
  const results =
    status === 'completed' || status === 'live'
      ? [...demoTeams]
          .map((t) => ({t, r: rand()}))
          .sort((a, b) => a.r - b.r)
          .map(({t}, idx) => {
            const placement = idx + 1;
            const kills = Math.max(
              0,
              Math.round((8 - placement) * 1.2 * rand() + rand() * 4)
            );
            const placementPoints = PLACEMENT_POINTS[idx] ?? 0;
            return {
              team: t,
              placement,
              kills,
              placementPoints,
              killPoints: kills,
              totalPoints: placementPoints + kills
            };
          })
      : [];
  return {
    id,
    tournamentId: tournament.id,
    tournamentSlug: tournament.slug,
    tournamentName: tournament.name,
    stage,
    matchNumber,
    map: MAPS[(matchNumber - 1) % MAPS.length],
    scheduledAt: iso(scheduledMs),
    status,
    streamUrl: tournament.streamUrl,
    results
  };
}

export function demoMatches(): MatchWithResults[] {
  const n = now();
  const [pmwc] = demoTournaments();
  const list: MatchWithResults[] = [];
  // Completed matches over the last two days
  for (let i = 1; i <= 6; i++) {
    list.push(
      buildMatch(
        `m${i}`,
        pmwc,
        i,
        n - 2 * DAY + i * 7 * HOUR,
        'completed',
        i <= 5 ? 'Group Stage – Day 1' : 'Group Stage – Day 2'
      )
    );
  }
  // One live match right now
  list.push(
    buildMatch(`m7`, pmwc, 7, n - 20 * 60_000, 'live', 'Group Stage – Day 2')
  );
  // Upcoming matches within the next 48h
  for (let i = 8; i <= 12; i++) {
    list.push(
      buildMatch(
        `m${i}`,
        pmwc,
        i,
        n + (i - 7) * 6 * HOUR,
        'scheduled',
        i <= 10 ? 'Group Stage – Day 3' : 'Group Stage – Day 4'
      )
    );
  }
  return list;
}

export function demoStandings(): StandingRow[] {
  const totals = new Map<
    string,
    {team: TeamSummary; kills: number; points: number; played: number}
  >();
  for (const match of demoMatches()) {
    if (match.status !== 'completed' && match.status !== 'live') continue;
    for (const r of match.results) {
      const entry = totals.get(r.team.id) ?? {
        team: r.team,
        kills: 0,
        points: 0,
        played: 0
      };
      entry.kills += r.kills;
      entry.points += r.totalPoints;
      entry.played += 1;
      totals.set(r.team.id, entry);
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.points - a.points || b.kills - a.kills)
    .map((e, i) => ({
      rank: i + 1,
      team: e.team,
      matchesPlayed: e.played,
      totalKills: e.kills,
      totalPoints: e.points
    }));
}

export function demoLiveState(): LiveState | null {
  const tournament = demoTournaments().find((t) => t.status === 'ongoing');
  if (!tournament) return null;
  return {
    tournament,
    standings: demoStandings(),
    matches: demoMatches()
      .filter((m) => m.status === 'completed' || m.status === 'live')
      .sort((a, b) => (b.matchNumber ?? 0) - (a.matchNumber ?? 0))
  };
}

export function demoTournamentDetail(slug: string): TournamentDetail | null {
  const summary = demoTournaments().find((t) => t.slug === slug);
  if (!summary) return null;
  const standings = summary.status === 'ongoing' ? demoStandings() : null;
  const completedRanks =
    summary.status === 'completed'
      ? [...demoTeams].map((t, i) => ({team: t, rank: i + 1}))
      : null;
  const participants = demoTeams.slice(0, summary.teamCount);
  return {
    ...summary,
    format:
      summary.tier === 's'
        ? '20 teams, round robin group stage then Grand Finals. SUPER points system, 1 point per kill.'
        : 'League phase followed by Finals. SUPER points system.',
    teams: participants.map((t, i) => {
      const standing = standings?.find((s) => s.team.id === t.id);
      const completed = completedRanks?.find((c) => c.team.id === t.id);
      return {
        ...t,
        seed: i + 1,
        finalRank: completed?.rank ?? null,
        totalPoints: standing?.totalPoints ?? 0,
        totalKills: standing?.totalKills ?? 0
      };
    })
  };
}

export function demoTeamDetail(slug: string): TeamDetail | null {
  const summary = demoTeams.find((t) => t.slug === slug);
  if (!summary) return null;
  const results = demoTournaments()
    .filter((t) => t.status === 'completed')
    .map((t, i) => ({
      tournamentSlug: t.slug,
      tournamentName: t.name,
      endDate: t.endDate,
      finalRank:
        ((demoTeams.findIndex((x) => x.id === summary.id) + i * 3) % 8) + 1,
      totalPoints: 120 - ((demoTeams.findIndex((x) => x.id === summary.id) + i) % 8) * 9
    }));
  const transfers: TransferView[] =
    summary.id === 't1'
      ? [
          {
            id: 'tf1',
            playerNickname: 'Spring',
            fromTeamName: null,
            toTeamName: summary.name,
            transferDate: isoDate(now() - 90 * DAY)
          }
        ]
      : [];
  return {
    ...summary,
    fullName: summary.orgName ? `${summary.orgName} — ${summary.name}` : null,
    roster: demoRosters[summary.id] ?? [],
    recentResults: results,
    transfers
  };
}

export function demoNews(): NewsItemView[] {
  const n = now();
  return [
    {
      id: 'n1',
      slug: 'pmwc-2026-group-stage-underway',
      title: 'PMWC 2026: group stage underway, Nova Esports sets the pace',
      excerpt:
        'The World Cup group stage kicked off with dominant early performances and a packed leaderboard after day one.',
      body: 'The PUBG Mobile World Cup 2026 group stage is in full swing. After the opening day, only a handful of points separate the top four teams, with aggressive early-zone fights defining the meta. Day 2 continues today with five more matches on the schedule.',
      coverUrl: null,
      sourceName: 'Official announcement',
      sourceUrl: 'https://www.pubgmobile.com/en/event/esports',
      publishedAt: iso(n - 1 * DAY),
      tags: ['tournaments', 'results']
    },
    {
      id: 'n2',
      slug: 'pmgc-2026-dates-announced',
      title: 'PMGC 2026 dates and $3.5M prize pool announced',
      excerpt:
        'The Global Championship returns with its biggest prize pool to date and a revamped qualification path.',
      body: 'The PUBG Mobile Global Championship 2026 has been officially scheduled. Regional leagues will send their top squads to the league stage, with the Grand Finals played on LAN. The prize pool rises to $3,500,000.',
      coverUrl: null,
      sourceName: 'Official announcement',
      sourceUrl: 'https://www.pubgmobile.com/en/event/esports',
      publishedAt: iso(n - 3 * DAY),
      tags: ['tournaments']
    },
    {
      id: 'n3',
      slug: 'spring-joins-nova',
      title: 'Nova Esports adds Spring to its PMGC roster',
      excerpt:
        'The Chinese powerhouse completes its lineup with a young scout ahead of the fall season.',
      body: 'Nova Esports announced the signing of Spring as their fifth man. The 19-year-old joins from the academy scene and will play the scout role alongside Order, Paraboy, Jimmy and Coolboy.',
      coverUrl: null,
      sourceName: 'Team announcement',
      sourceUrl: null,
      publishedAt: iso(n - 6 * DAY),
      tags: ['transfers']
    },
    {
      id: 'n4',
      slug: 'patch-3-9-esports-mode',
      title: 'Patch 3.9: what changes for competitive play',
      excerpt:
        'Zone timings tweaked on Erangel and a recoil pass on DMRs — here is what pros need to know.',
      body: 'The 3.9 update adjusts circle speed in phases 4 and 5 on Erangel, slightly reducing edge-zone plays. DMR recoil was increased across the board, while the M24 spawn rate goes up in competitive settings.',
      coverUrl: null,
      sourceName: 'Patch notes',
      sourceUrl: 'https://www.pubgmobile.com/en/event/esports',
      publishedAt: iso(n - 10 * DAY),
      tags: ['patch-notes']
    },
    {
      id: 'n5',
      slug: 'vampire-wins-pmsl-sea',
      title: 'Vampire Esports crowned PMSL SEA Spring champions',
      excerpt:
        'A 23-kill final day secured the trophy and a direct PMWC seed for the Thai squad.',
      body: 'Vampire Esports closed out the PMSL SEA Spring 2026 season with a spectacular final day, overturning a 15-point deficit. The victory secures a direct seed to the World Cup.',
      coverUrl: null,
      sourceName: 'Results',
      sourceUrl: null,
      publishedAt: iso(n - 62 * DAY),
      tags: ['results', 'tournaments']
    }
  ];
}

export const demoTranslations: TranslationRow[] = [
  {
    entityType: 'news',
    entityId: 'n1',
    field: 'title',
    locale: 'fr',
    value: 'PMWC 2026 : la phase de groupes est lancée, Nova Esports donne le ton'
  },
  {
    entityType: 'news',
    entityId: 'n1',
    field: 'excerpt',
    locale: 'fr',
    value:
      'La phase de groupes de la Coupe du monde a démarré avec des performances dominantes et un classement très serré après la première journée.'
  },
  {
    entityType: 'news',
    entityId: 'n1',
    field: 'body',
    locale: 'fr',
    value:
      'La phase de groupes de la PUBG Mobile World Cup 2026 bat son plein. Après la journée d’ouverture, seuls quelques points séparent les quatre premières équipes, avec des combats précoces qui définissent la méta. La journée 2 continue aujourd’hui avec cinq manches au programme.'
  },
  {
    entityType: 'news',
    entityId: 'n2',
    field: 'title',
    locale: 'fr',
    value: 'PMGC 2026 : dates annoncées et prize pool de 3,5 M$'
  },
  {
    entityType: 'news',
    entityId: 'n2',
    field: 'excerpt',
    locale: 'fr',
    value:
      'Le Global Championship revient avec son plus gros prize pool à ce jour et un parcours de qualification repensé.'
  },
  {
    entityType: 'news',
    entityId: 'n2',
    field: 'body',
    locale: 'fr',
    value:
      'La PUBG Mobile Global Championship 2026 est officiellement programmée. Les ligues régionales enverront leurs meilleures équipes en phase de ligue, avec une grande finale en LAN. Le prize pool passe à 3 500 000 $.'
  },
  {
    entityType: 'news',
    entityId: 'n3',
    field: 'title',
    locale: 'fr',
    value: 'Nova Esports recrute Spring pour son roster PMGC'
  },
  {
    entityType: 'news',
    entityId: 'n3',
    field: 'excerpt',
    locale: 'fr',
    value:
      'Le géant chinois complète son effectif avec un jeune éclaireur avant la saison d’automne.'
  },
  {
    entityType: 'news',
    entityId: 'n3',
    field: 'body',
    locale: 'fr',
    value:
      'Nova Esports a annoncé la signature de Spring comme cinquième joueur. Le joueur de 19 ans arrive de la scène académique et occupera le rôle d’éclaireur aux côtés d’Order, Paraboy, Jimmy et Coolboy.'
  },
  {
    entityType: 'news',
    entityId: 'n4',
    field: 'title',
    locale: 'fr',
    value: 'Patch 3.9 : ce qui change pour le jeu compétitif'
  },
  {
    entityType: 'news',
    entityId: 'n4',
    field: 'excerpt',
    locale: 'fr',
    value:
      'Timings de zone ajustés sur Erangel et refonte du recul des DMR — voici ce que les pros doivent savoir.'
  },
  {
    entityType: 'news',
    entityId: 'n4',
    field: 'body',
    locale: 'fr',
    value:
      'La mise à jour 3.9 ajuste la vitesse du cercle en phases 4 et 5 sur Erangel, réduisant légèrement les stratégies de bord de zone. Le recul des DMR augmente globalement, tandis que le taux d’apparition du M24 progresse en configuration compétitive.'
  },
  {
    entityType: 'news',
    entityId: 'n5',
    field: 'title',
    locale: 'fr',
    value: 'Vampire Esports sacré champion PMSL SEA Spring'
  },
  {
    entityType: 'news',
    entityId: 'n5',
    field: 'excerpt',
    locale: 'fr',
    value:
      'Une dernière journée à 23 kills a offert le trophée et une place directe au PMWC à l’équipe thaïlandaise.'
  },
  {
    entityType: 'news',
    entityId: 'n5',
    field: 'body',
    locale: 'fr',
    value:
      'Vampire Esports a conclu la saison PMSL SEA Spring 2026 avec une dernière journée spectaculaire, remontant un retard de 15 points. Cette victoire garantit une qualification directe pour la Coupe du monde.'
  }
];
