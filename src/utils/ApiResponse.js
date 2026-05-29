// ============================================
// CESUS – utils/ApiResponse.js
// Réponses API standardisées
// ============================================

class ApiResponse {
  /**
   * Réponse succès
   * @param {object} res - Express response
   * @param {any} data - Données à retourner
   * @param {string} message
   * @param {number} statusCode
   * @param {object} meta - Pagination, etc.
   */
  static success(res, data = null, message = 'Succès', statusCode = 200, meta = null) {
    const response = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  /**
   * Réponse création
   */
  static created(res, data, message = 'Créé avec succès') {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Réponse liste paginée
   */
  static paginated(res, data, total, page, limit, message = 'Liste récupérée') {
    const meta = {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
    return ApiResponse.success(res, data, message, 200, meta);
  }

  /**
   * Réponse erreur
   */
  static error(res, message = 'Erreur', statusCode = 500, code = 'ERROR', details = null) {
    const response = {
      success: false,
      message,
      error: {
        code,
        details,
      },
      // Champs conserves pour retrocompatibilite avec les tests et clients existants.
      code,
    };
    if (details) response.details = details;
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
