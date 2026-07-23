require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ERREUR : la variable ANTHROPIC_API_KEY est manquante. Crée un fichier .env à partir de .env.example.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TONE_INSTRUCTIONS = {
  professionnel: "un ton professionnel, courtois et posé, sans familiarité",
  chaleureux: "un ton chaleureux, humain et empathique, avec de la reconnaissance sincère",
  concis: "un ton concis et efficace, allant droit au but en 2-3 phrases maximum",
};

app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate-reply', async (req, res) => {
  const { review, tone } = req.body;

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ error: "Le texte de l'avis client est requis." });
  }

  const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professionnel;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Tu es un assistant qui aide un commerce (hôtel, restaurant, salon...) à répondre aux avis de ses clients.

Voici l'avis client :
"""
${review.trim()}
"""

Rédige une réponse en français avec ${toneInstruction}. La réponse doit :
- s'adresser directement au client
- reconnaître les points mentionnés dans l'avis (positifs ou négatifs)
- rester crédible et ne jamais inventer de faits non mentionnés dans l'avis
- se terminer par une signature générique du type "L'équipe"

Réponds uniquement avec le texte de la réponse, sans introduction ni commentaire.`,
        },
      ],
    });

    const replyText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Erreur API Anthropic :', error);
    res.status(500).json({ error: "Impossible de générer la réponse pour le moment. Réessaie dans un instant." });
  }
});

app.listen(PORT, () => {
  console.log(`ReplyBoost est en ligne sur http://localhost:${PORT}`);
});
