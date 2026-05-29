// ============================================
// CESUS – middlewares/error.middleware.js
// Gestion centralisée des erreurs (principe S de SOLID)
// ============================================
const { AppError } = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger');

/**
 * Transforme les erreurs Prisma en AppError lisibles
 */
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return new AppError(
        `Valeur en double sur le champ: ${error.meta?.target?.join(', ')}`,
        409,
        'DUPLICATE_VALUE'
      );
    case 'P2025':
      return new AppError('Enregistrement introuvable', 404, 'NOT_FOUND');
    case 'P2003':
      return new AppError('Relation introuvable (clé étrangère invalide)', 400, 'FOREIGN_KEY_ERROR');
    case 'P2014':
      return new AppError('Violation de contrainte relationnelle', 400, 'RELATION_VIOLATION');
    default:
      return new AppError('Erreur base de données', 500, 'DB_ERROR');
  }
};

/**
 * Middleware global de gestion des erreurs
 * Doit être enregistré EN DERNIER dans app.js
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transformer les erreurs Prisma
  if (err.code && err.code.startsWith('P')) {
    error = handlePrismaError(err);
  }

  // Transformer les erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token invalide', 401, 'TOKEN_INVALID');
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expiré', 401, 'TOKEN_EXPIRED');
  }

  // Transformer les erreurs de validation Joi
  if (err.isJoi) {
    const details = err.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    error = new AppError('Erreurs de validation', 422, 'VALIDATION_ERROR', details);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur';

  // Log selon la gravité
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`, {
      stack: err.stack,
      userId: req.user?.id,
      body: req.body,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);
  }

  return ApiResponse.error(res, message, statusCode, error.code, error.details);
};

/**
 * Middleware pour les routes non trouvées
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route introuvable: ${req.method} ${req.path}`, 404, 'ROUTE_NOT_FOUND'));
};

module.exports = { errorHandler, notFound };