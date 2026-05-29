// ============================================
// CESUS – utils/pagination.js
// Helper pour la pagination
// ============================================

/**
 * Extrait les paramètres de pagination depuis la query
 * @param {object} query - req.query
 * @returns {{ skip, take, page, limit }}
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

/**
 * Construit le filtre de soft delete
 * @param {boolean} includeDeleted
 */
const softDeleteFilter = (includeDeleted = false) => {
  return includeDeleted ? {} : { deletedAt: null };
};

module.exports = { getPagination, softDeleteFilter };