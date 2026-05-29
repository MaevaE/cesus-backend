// ============================================
// CESUS - src/server.js
// Point d'entree HTTP : charge l'application Express, connecte PostgreSQL et demarre le serveur.
// ============================================
require('dotenv').config();

const app = require('./app');
const { connectDB, prisma } = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

/**
 * Demarre l'API CESUS apres verification de la connexion base de donnees.
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`CESUS API demarree sur http://0.0.0.0:${PORT}`);
      logger.info(`Depuis le PC: http://localhost:${PORT}`);
      logger.info(`Depuis un telephone: http://<IP_LOCALE_DU_PC>:${PORT}`);
    });

    /**
     * Ferme proprement le serveur HTTP et la connexion Prisma.
     * @param {string} signal - Signal systeme recu.
     */
    const gracefulShutdown = async (signal) => {
      logger.info(`Signal ${signal} recu. Arret gracieux...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Serveur arrete proprement');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error(`Impossible de demarrer le serveur: ${error.message}`);
    process.exit(1);
  }
};

startServer();
