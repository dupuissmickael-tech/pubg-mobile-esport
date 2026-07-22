require('dotenv').config();
const express = require('express');
const path = require('path');
const playersRouter = require('./src/routes/players');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.PUBG_API_KEY) {
  console.warn('⚠️  PUBG_API_KEY absente : copie .env.example vers .env et renseigne ta clé.');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', playersRouter);

app.listen(PORT, () => {
  console.log(`StatDrop lancé sur http://localhost:${PORT}`);
});
