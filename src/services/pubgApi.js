const SimpleCache = require('../utils/cache');
const RateLimiter = require('../utils/rateLimiter');

const API_BASE = 'https://api.pubg.com';

// Limite officielle de l'API PUBG : 10 requêtes / minute par clé.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// Un joueur bouge peu en 2 minutes, une partie terminée ne change jamais.
const PLAYER_CACHE_TTL_MS = 2 * 60 * 1000;
const MATCH_CACHE_TTL_MS = 30 * 60 * 1000;

// Mapping plateforme (choisie côté UI) -> shard attendu par l'API PUBG.
const PLATFORM_SHARDS = {
  steam: 'steam',
  xbox: 'xbox',
  playstation: 'psn',
};

const cache = new SimpleCache();
const rateLimiter = new RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

async function pubgFetch(path, ttlMs) {
  const cached = cache.get(path);
  if (cached) return cached;

  const apiKey = process.env.PUBG_API_KEY;
  if (!apiKey) {
    throw new Error('PUBG_API_KEY manquante : configure ton fichier .env');
  }

  const data = await rateLimiter.schedule(async () => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/vnd.api+json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        const err = new Error('Joueur introuvable');
        err.statusCode = 404;
        throw err;
      }
      if (res.status === 429) {
        const err = new Error("Limite de requêtes de l'API PUBG atteinte, réessaie dans un instant");
        err.statusCode = 429;
        throw err;
      }
      const body = await res.text();
      const err = new Error(`Erreur API PUBG (${res.status}): ${body}`);
      err.statusCode = 502;
      throw err;
    }

    return res.json();
  });

  cache.set(path, data, ttlMs);
  return data;
}

function shardForPlatform(platform) {
  return PLATFORM_SHARDS[platform] || null;
}

async function getPlayerByName(shard, playerName) {
  const path = `/shards/${shard}/players?filter[playerNames]=${encodeURIComponent(playerName)}`;
  const json = await pubgFetch(path, PLAYER_CACHE_TTL_MS);
  const player = json.data && json.data[0];
  if (!player) {
    const err = new Error('Joueur introuvable');
    err.statusCode = 404;
    throw err;
  }
  return player;
}

async function getMatch(shard, matchId) {
  const path = `/shards/${shard}/matches/${matchId}`;
  return pubgFetch(path, MATCH_CACHE_TTL_MS);
}

// Retrouve les stats du joueur dans le payload d'une partie (participants inclus).
function extractParticipantStats(matchData, playerId) {
  const included = matchData.included || [];
  const participant = included.find(
    (item) => item.type === 'participant' && item.attributes?.stats?.playerId === playerId
  );
  return participant ? participant.attributes.stats : null;
}

module.exports = {
  PLATFORM_SHARDS,
  shardForPlatform,
  getPlayerByName,
  getMatch,
  extractParticipantStats,
};
