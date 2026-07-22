const express = require('express');
const {
  PLATFORM_LABELS,
  shardForPlatform,
  getPlayerByName,
  getMatch,
  extractParticipantStats,
} = require('../services/pubgApi');

const router = express.Router();

// On limite le nombre de parties récupérées pour rester sous la limite
// de 10 requêtes/minute de l'API PUBG (1 requête joueur + N requêtes parties).
const MAX_MATCHES = 5;

router.get('/player', async (req, res) => {
  const name = (req.query.name || '').trim();
  const platform = (req.query.platform || '').trim().toLowerCase();

  if (!name) {
    return res.status(400).json({ error: 'Merci de renseigner un pseudo.' });
  }
  if (!platform) {
    return res.status(400).json({ error: 'Merci de choisir une plateforme.' });
  }

  const shard = shardForPlatform(platform);
  if (!shard) {
    const validPlatforms = Object.values(PLATFORM_LABELS).join(', ');
    return res.status(400).json({
      error: `Plateforme invalide. Plateformes acceptées : ${validPlatforms}.`,
    });
  }

  try {
    const player = await getPlayerByName(shard, name, platform);
    const matchRefs = (player.relationships?.matches?.data || []).slice(0, MAX_MATCHES);

    const matches = [];
    for (const ref of matchRefs) {
      const matchData = await getMatch(shard, ref.id);
      const stats = extractParticipantStats(matchData, player.id);
      if (!stats) continue;

      matches.push({
        matchId: ref.id,
        gameMode: matchData.data.attributes.gameMode,
        createdAt: matchData.data.attributes.createdAt,
        kills: stats.kills,
        damage: Math.round(stats.damageDealt),
        rank: stats.winPlace,
        chickenDinner: stats.winPlace === 1,
      });
    }

    matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      playerName: player.attributes.name,
      platform,
      matches,
      noRecentMatches: matches.length === 0,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode >= 500) {
      console.error(err);
    }
    res.status(statusCode).json({ error: err.message || 'Erreur serveur inattendue.' });
  }
});

module.exports = router;
