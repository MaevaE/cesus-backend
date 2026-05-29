// ============================================
// CESUS – config/jwt.js
// Configuration et helpers JWT
// ============================================
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

const jwtConfig = {
  accessSecret: process.env.JWT_SECRET,
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

/**
 * Génère un access token JWT
 * @param {object} payload - Données à encoder
 * @returns {string} token signé
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
    issuer: 'cesus-api',
  });
};

/**
 * Génère un refresh token JWT
 * @param {object} payload
 * @returns {string} token signé
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: 'cesus-api',
  });
};

/**
 * Vérifie et décode un access token
 * @param {string} token
 * @returns {object} payload décodé
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expiré', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Token invalide', 401, 'TOKEN_INVALID');
  }
};

/**
 * Vérifie et décode un refresh token
 * @param {string} token
 * @returns {object} payload décodé
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expiré', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    throw new AppError('Refresh token invalide', 401, 'REFRESH_TOKEN_INVALID');
  }
};

module.exports = {
  jwtConfig,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};