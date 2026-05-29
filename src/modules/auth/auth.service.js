// ============================================
// CESUS – services/auth.service.js
// Logique métier auth (principe S de SOLID)
// ============================================
const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../config/jwt');
const { AppError, Errors } = require('../../utils/AppError');
const logger = require('../../config/logger');

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(email, motDePasse) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.actif) {
      throw new AppError('Compte désactivé. Contactez l\'administrateur.', 403, 'ACCOUNT_DISABLED');
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      throw new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS');
    }

    const payload = { userId: user.id, role: user.role.nom };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Stocker le refresh token en base (révocable)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30j
    await userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    logger.info(`Connexion réussie: ${user.email} (${user.role.nom})`);

    const { motDePasse: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Inscription (admin seulement)
   */
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409, 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.motDePasse, 12);

    const userData = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      motDePasse: hashedPassword,
      telephone: data.telephone,
      roleId: data.roleId,
    };

    // Si c'est un agent, créer l'entrée agent automatiquement
    const { prisma } = require('../../config/database');
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });

    if (role?.nom === 'AGENT') {
      userData.agent = { create: {} };
    }

    const user = await userRepository.create(userData);
    logger.info(`Nouvel utilisateur créé: ${user.email} (${user.role.nom})`);

    const { motDePasse: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Auto-inscription d'un agent depuis le mobile MVP.
   * @param {object} data - Donnees du formulaire mobile.
   * @returns {Promise<object>} Utilisateur agent sans mot de passe.
   */
  async registerAgent(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Cet email est deja utilise', 409, 'EMAIL_EXISTS');
    }

    const { prisma } = require('../../config/database');
    const agentRole = await prisma.role.findUnique({ where: { nom: 'AGENT' } });
    if (!agentRole) {
      throw new AppError('Role AGENT introuvable. Lancez le seed de la base.', 500, 'ROLE_NOT_FOUND');
    }

    const parts = data.name ? data.name.trim().split(/\s+/) : [];
    const prenom = data.prenom || (parts.length > 1 ? parts.shift() : '');
    const nom = data.nom || (parts.length ? parts.join(' ') : data.name);
    const hashedPassword = await bcrypt.hash(data.motDePasse, 12);

    const user = await userRepository.create({
      nom,
      prenom: prenom || '-',
      email: data.email,
      motDePasse: hashedPassword,
      telephone: data.telephone,
      roleId: agentRole.id,
      agent: {
        create: {
          ...(data.zoneId && { zoneId: data.zoneId }),
        },
      },
    });

    logger.info(`Nouvel agent mobile cree: ${user.email}`);
    const { motDePasse: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Renouvellement du token
   */
  async refreshToken(token) {
    const stored = await userRepository.findRefreshToken(token);

    if (!stored || stored.revoked) {
      throw new AppError('Refresh token invalide ou révoqué', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (new Date() > stored.expiresAt) {
      throw new AppError('Refresh token expiré', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    // Vérifier la signature JWT
    verifyRefreshToken(token);

    const user = stored.user;
    const payload = { userId: user.id, role: user.role.nom };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotation des refresh tokens (sécurité)
    await userRepository.revokeRefreshToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Déconnexion
   */
  async logout(refreshToken, userId) {
    if (refreshToken) {
      await userRepository.revokeRefreshToken(refreshToken).catch(() => {});
    } else {
      await userRepository.revokeAllUserTokens(userId);
    }
    logger.info(`Déconnexion: userId=${userId}`);
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(userId, ancienMotDePasse, nouveauMotDePasse) {
    const user = await userRepository.findById(userId);
    if (!user) throw Errors.notFound('Utilisateur');

    const isValid = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!isValid) {
      throw new AppError('Ancien mot de passe incorrect', 400, 'WRONG_PASSWORD');
    }

    const hashed = await bcrypt.hash(nouveauMotDePasse, 12);
    await userRepository.update(userId, { motDePasse: hashed });

    // Révoquer tous les tokens (déconnexion forcée)
    await userRepository.revokeAllUserTokens(userId);
    logger.info(`Mot de passe changé: userId=${userId}`);
  }
}

module.exports = new AuthService();
