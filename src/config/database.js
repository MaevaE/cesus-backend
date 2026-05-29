// // ============================================
// // CESUS – config/database.js
// // Singleton Prisma Client
// // ============================================
// const { PrismaClient } = require('@prisma/client');
// const logger = require('./logger');

// const prisma = new PrismaClient({
//   log: [
//     { emit: 'event', level: 'query' },
//     { emit: 'event', level: 'error' },
//     { emit: 'event', level: 'warn' },
//   ],
// });

// // Log les requêtes en mode développement uniquement
// if (process.env.NODE_ENV === 'development') {
//   prisma.$on('query', (e) => {
//     logger.debug(`Prisma Query: ${e.query} | Durée: ${e.duration}ms`);
//   });
// }

// prisma.$on('error', (e) => {
//   logger.error(`Prisma Error: ${e.message}`);
// });

// prisma.$on('warn', (e) => {
//   logger.warn(`Prisma Warning: ${e.message}`);
// });

// /**
//  * Teste la connexion à la base de données
//  */
// const connectDB = async () => {
//   try {
//     await prisma.$connect();
//     logger.info('✅ PostgreSQL connecté via Prisma');
//   } catch (error) {
//     logger.error(`❌ Erreur connexion DB: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = { prisma, connectDB };

// ============================================
// CESUS – config/database.js
// Singleton Prisma Client
// ============================================
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const logger = require('./logger');

// Créer le pool de connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Créer l'adaptateur Prisma
const adapter = new PrismaPg(pool);

// Initialiser Prisma Client avec l'adaptateur
const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log les requêtes en mode développement uniquement
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Prisma Query: ${e.query} | Durée: ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

/**
 * Teste la connexion à la base de données
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connecté via Prisma');
  } catch (error) {
    logger.error(`❌ Erreur connexion DB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };