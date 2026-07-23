# ReplyBoost

Application web simple qui aide les commerces (hôtels, restaurants, salons) à
répondre aux avis clients, positifs comme négatifs, grâce à Claude (Anthropic).

## Fonctionnalités

- Coller le texte d'un avis client
- Choisir le ton de la réponse : Professionnel, Chaleureux, Concis
- Générer une réponse en français via l'API Anthropic
- Copier la réponse générée en un clic

## Installation

```bash
npm install
cp .env.example .env
```

Ouvre `.env` et renseigne ta clé API Anthropic :

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Lancer l'application

```bash
npm start
```

Puis ouvre [http://localhost:3000](http://localhost:3000).

## Stack

- Backend : Node.js + Express
- Frontend : HTML / CSS / JS vanilla
- IA : SDK officiel `@anthropic-ai/sdk` (modèle Claude Sonnet)
