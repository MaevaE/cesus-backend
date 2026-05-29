// ============================================
// CESUS – middlewares/validate.middleware.js
// Validation des entrées via Joi
// ============================================
const { AppError } = require('../utils/AppError');

/**
 * Factory de middleware de validation Joi
 * @param {Joi.Schema} schema - Schéma de validation
 * @param {'body'|'query'|'params'} source - Source des données
 * @returns middleware Express
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,    // Retourner toutes les erreurs
      stripUnknown: true,   // Supprimer les champs inconnus
      convert: true,        // Convertir les types
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return next(new AppError('Erreurs de validation', 422, 'VALIDATION_ERROR', details));
    }

    req[source] = value; // Remplacer par les données nettoyées
    next();
  };
};

module.exports = { validate };