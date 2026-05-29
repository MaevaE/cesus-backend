// ============================================
// CESUS – middlewares/rateLimiter.middleware.js
// Limitation du taux de requêtes
// ============================================
const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/ApiResponse');

// Limiteur général
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Trop de requêtes. Réessayez dans quelques minutes.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

// Limiteur strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 tentatives max
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      429,
      'AUTH_RATE_LIMIT'
    );
  },
});

module.exports = { generalLimiter, authLimiter };
