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

// Libellés lisibles utilisés dans les messages d'erreur.
const PLATFORM_LABELS = {
  steam: 'Steam',
  xbox: 'Xbox',
  playstation: 'PlayStation',
};

class PubgApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const cache = new SimpleCache();
const rateLimiter = new RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

async function pubgFetch(path, ttlMs) {
  const cached = cache.get(path);
  if (cached) return cached;

  const apiKey = process.env.PUBG_API_KEY;
  if (!apiKey) {
    throw new PubgApiError('PUBG_API_KEY manquante : configure ton fichier .env', 500);
  }

  const data = await rateLimiter.schedule(async () => {
    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json',
        },
      });
    } catch (networkErr) {
      throw new PubgApiError(
        "Impossible de contacter l'API PUBG (problème réseau), réessaie plus tard.",
        502
      );
    }

    if (!res.ok) {
      if (res.status === 404) {
        throw new PubgApiError('NOT_FOUND', 404);
      }
      if (res.status === 401 || res.status === 403) {
        console.error(`Clé API PUBG rejetée (HTTP ${res.status})`);
        throw new PubgApiError(
          "Clé API PUBG invalide ou non autorisée. Vérifie la valeur de PUBG_API_KEY dans .env.",
          res.status
        );
      }
      if (res.status === 429) {
        throw new PubgApiError(
          "Limite de requêtes de l'API PUBG atteinte, réessaie dans un instant.",
          429
        );
      }
      const body = await res.text();
      console.error(`Erreur API PUBG (${res.status}): ${body}`);
      throw new PubgApiError("Erreur inattendue de l'API PUBG, réessaie plus tard.", 502);
    }

    return res.json();
  });

  cache.set(path, data, ttlMs);
  return data;
}

function shardForPlatform(platform) {
  return PLATFORM_SHARDS[platform] || null;
}

async function getPlayerByName(shard, playerName, platform) {
  const path = `/shards/${shard}/players?filter[playerNames]=${encodeURIComponent(playerName)}`;
  const platformLabel = PLATFORM_LABELS[platform] || platform;

  let json;
  try {
    json = await pubgFetch(path, PLAYER_CACHE_TTL_MS);
  } catch (err) {
    if (err.statusCode === 404) {
      throw new PubgApiError(
        `Aucun joueur nommé "${playerName}" trouvé sur ${platformLabel}. Vérifie l'orthographe du pseudo ou essaie une autre plateforme.`,
        404
      );
    }
    throw err;
  }

  const player = json.data && json.data[0];
  if (!player) {
    throw new PubgApiError(
      `Aucun joueur nommé "${playerName}" trouvé sur ${platformLabel}. Vérifie l'orthographe du pseudo ou essaie une autre plateforme.`,
      404
    );
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
  PLATFORM_LABELS,
  PubgApiError,
  shardForPlatform,
  getPlayerByName,
  getMatch,
  extractParticipantStats,
};
