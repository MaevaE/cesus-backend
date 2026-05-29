// ============================================
// CESUS - utils/auditLog.js
// Journalisation metier non bloquante dans la table logs.
// ============================================
const { prisma } = require('../config/database');
const logger = require('../config/logger');

/**
 * @description Enregistre une action importante dans la table logs sans bloquer la requete HTTP.
 * @param {Object} options - Donnees de journalisation.
 * @param {string} options.action - Nom court de l'action realisee.
 * @param {string} [options.entite] - Type d'entite concernee.
 * @param {string} [options.entiteId] - Identifiant de l'entite concernee.
 * @param {Object} [options.req] - Requete Express, utilisee pour recuperer l'utilisateur et l'adresse IP.
 * @param {string} [options.userId] - Identifiant utilisateur explicite lorsque req.user n'existe pas.
 * @param {Object} [options.details] - Details JSON utiles au suivi.
 * @returns {Promise<void>} Ne retourne aucune donnee au client.
 */
async function logAction({ action, entite = null, entiteId = null, req = null, userId = null, details = null }) {
  try {
    await prisma.log.create({
      data: {
        action,
        entite,
        entiteId,
        details,
        userId: userId || req?.user?.id || null,
        ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      },
    });
  } catch (error) {
    logger.warn(`Journalisation ignoree (${action}): ${error.message}`);
  }
}

module.exports = { logAction };
