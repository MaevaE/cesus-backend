// ============================================
// CESUS – controllers/auth.controller.js
// Reçoit req/res, délègue au service
// ============================================
const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const { logAction } = require('../../utils/auditLog');

class AuthController {
  async login(req, res, next) {
    try {
      const { email } = req.body;
      const motDePasse = req.body.motDePasse || req.body.password;
      const result = await authService.login(email, motDePasse);
      await logAction({
        action: 'AUTH_LOGIN',
        entite: 'users',
        entiteId: result.user.id,
        userId: result.user.id,
        req,
      });
      return ApiResponse.success(res, result, 'Connexion réussie');
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      await logAction({
        action: 'USER_REGISTER',
        entite: 'users',
        entiteId: user.id,
        req,
        details: { email: user.email, role: user.role?.nom },
      });
      return ApiResponse.created(res, user, 'Utilisateur créé avec succès');
    } catch (error) {
      next(error);
    }
  }

  async registerAgent(req, res, next) {
    try {
      const user = await authService.registerAgent(req.body);
      await logAction({
        action: 'AGENT_SELF_REGISTER',
        entite: 'users',
        entiteId: user.id,
        userId: user.id,
        req,
        details: { email: user.email },
      });
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
      await logAction({ action: 'AUTH_LOGOUT', entite: 'users', entiteId: req.user.id, req });
      return ApiResponse.success(res, null, 'Déconnexion réussie');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
      await authService.changePassword(req.user.id, ancienMotDePasse, nouveauMotDePasse);
      await logAction({ action: 'AUTH_CHANGE_PASSWORD', entite: 'users', entiteId: req.user.id, req });
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
