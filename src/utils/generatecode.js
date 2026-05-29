// ============================================
// CESUS – utils/generateCode.js
// Génération de codes uniques
// ============================================

/**
 * Génère un code unique pour un ménage
 * Format : MEN-[ZONE_PREFIX]-[TIMESTAMP]-[RANDOM]
 * Exemple : MEN-YDE-1709145600-A3F
 *
 * @param {string} zoneNom - Nom de la zone
 * @returns {string} code unique
 */
const generateMenageCode = (zoneNom = 'GEN') => {
  const prefix = zoneNom.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MEN-${prefix}-${timestamp}-${random}`;
};

module.exports = { generateMenageCode };