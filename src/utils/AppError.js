// ============================================
// CESUS – utils/AppError.js
// Classe d'erreur personnalisée (principe S de SOLID)
// ============================================

class AppError extends Error {
  /**
   * @param {string} message - Message lisible
   * @param {number} statusCode - Code HTTP
   * @param {string} code - Code métier (ex: USER_NOT_FOUND)
   * @param {any} details - Détails supplémentaires (erreurs de validation)
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Erreur prévisible, pas un bug
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreurs prédéfinies courantes
const Errors = {
  notFound: (resource = 'Ressource') =>
    new AppError(`${resource} introuvable`, 404, 'NOT_FOUND'),

  unauthorized: (msg = 'Non autorisé') =>
    new AppError(msg, 401, 'UNAUTHORIZED'),

  forbidden: (msg = 'Accès refusé') =>
    new AppError(msg, 403, 'FORBIDDEN'),

  badRequest: (msg, details = null) =>
    new AppError(msg, 400, 'BAD_REQUEST', details),

  conflict: (msg) =>
    new AppError(msg, 409, 'CONFLICT'),

  validationError: (details) =>
    new AppError('Erreurs de validation', 422, 'VALIDATION_ERROR', details),
};

module.exports = { AppError, Errors };