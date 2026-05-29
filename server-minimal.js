// server-minimal.js
require('dotenv').config();

console.log('1. Chargement app...');
const app = require('./src/app');

console.log('2. Chargement database...');
const { connectDB } = require('./src/config/database');

console.log('3. Chargement logger...');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

console.log('4. Démarrage...');

async function start() {
  try {
    await connectDB();
    console.log('5. DB connectée');
    
    app.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur port ${PORT}`);
      console.log(`✅ Serveur sur http://localhost:${PORT}`);
    });
    console.log('6. Serveur lancé');
  } catch (err) {
    console.error('Erreur:', err);
  }
}

start();