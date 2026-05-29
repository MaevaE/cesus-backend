// ============================================
// CESUS – controllers/auth.controller.js
// Reçoit req/res, délègue au service
// ============================================
const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

class AuthController {
  async login(req, res, next) {
    try {
      const { email } = req.body;
      const motDePasse = req.body.motDePasse || req.body.password;
      const result = await authService.login(email, motDePasse);
      return ApiResponse.success(res, result, 'Connexion réussie');
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return ApiResponse.created(res, user, 'Utilisateur créé avec succès');
    } catch (error) {
      next(error);
    }
  }

  async registerAgent(req, res, next) {
    try {
      const user = await authService.registerAgent(req.body);
      return ApiResponse.created(res, user, 'Agent cree avec succes');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      return ApiResponse.success(res, tokens, 'Token renouvelé');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken, req.user.id);
      return ApiResponse.success(res, null, 'Déconnexion réussie');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
      await authService.changePassword(req.user.id, ancienMotDePasse, nouveauMotDePasse);
      return ApiResponse.success(res, null, 'Mot de passe modifié avec succès');
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const { motDePasse, ...user } = req.user;
      return ApiResponse.success(res, user, 'Profil récupéré');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
