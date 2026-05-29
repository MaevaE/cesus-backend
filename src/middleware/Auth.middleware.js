// ============================================
// CESUS – middlewares/auth.middleware.js
// Vérification JWT + contrôle des rôles
// ============================================
const { verifyAccessToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * Middleware d'authentification JWT
 * Vérifie le token Bearer et attache l'utilisateur à req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token manquant ou mal formé', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, actif: true, deletedAt: null },
      include: { role: true, agent: true },
    });

    if (!user) {
      throw new AppError('Utilisateur introuvable ou désactivé', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de contrôle des rôles (principe O de SOLID)
 * @param {...string} roles - Rôles autorisés
 * @returns middleware Express
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Non authentifié', 401, 'UNAUTHORIZED'));
    }

    const userRole = req.user.role.nom;

    if (!roles.includes(userRole)) {
      logger.warn(`Accès refusé: ${req.user.email} (${userRole}) → ${req.path}`);
      return next(
        new AppError(
          `Accès refusé. Rôles autorisés: ${roles.join(', ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };