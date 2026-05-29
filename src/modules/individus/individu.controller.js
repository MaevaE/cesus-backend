// ============================================
// CESUS - controllers/individu.controller.js
// Traduit les requetes HTTP individus vers le service metier.
// ============================================
const individuService = require('./individu.service');
const ApiResponse = require('../../utils/ApiResponse');
const { logAction } = require('../../utils/auditLog');

class IndividuController {
  /**
   * GET /api/v1/individus - liste globale filtree des individus.
   */
  async getAll(req, res, next) {
    try {
      const { data, total, page, limit } = await individuService.getAll(req.query, req.user);
      return ApiResponse.paginated(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  /**
   * GET /api/v1/menages/:menageId/individus - liste les individus d'un menage.
   */
  async getByMenage(req, res, next) {
    try {
      const { data, total, page, limit } = await individuService.getByMenage(
        req.params.menageId,
        req.query,
        req.user
      );
      return ApiResponse.paginated(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  /**
   * GET /api/v1/individus/:id - detail d'un individu.
   */
  async getById(req, res, next) {
    try {
      const individu = await individuService.getById(req.params.id, req.user);
      return ApiResponse.success(res, individu);
    } catch (e) { next(e); }
  }

  /**
   * POST /api/v1/menages/:menageId/individus ou POST /api/v1/individus.
   */
  async create(req, res, next) {
    try {
      const individu = await individuService.create(req.params.menageId, req.body, req.user);
      await logAction({
        action: 'INDIVIDU_CREATE',
        entite: 'individus',
        entiteId: individu.id,
        req,
        details: { menageId: individu.menageId },
      });
      return ApiResponse.created(res, individu, 'Individu ajoute');
    } catch (e) { next(e); }
  }

  /**
   * PATCH /api/v1/individus/:id - modifie un individu.
   */
  async update(req, res, next) {
    try {
      const individu = await individuService.update(req.params.id, req.body, req.user);
      await logAction({
        action: 'INDIVIDU_UPDATE',
        entite: 'individus',
        entiteId: individu.id,
        req,
        details: { champs: Object.keys(req.body) },
      });
      return ApiResponse.success(res, individu, 'Individu mis a jour');
    } catch (e) { next(e); }
  }

  /**
   * DELETE /api/v1/individus/:id - supprime logiquement un individu.
   */
  async delete(req, res, next) {
    try {
      await individuService.delete(req.params.id, req.user);
      await logAction({ action: 'INDIVIDU_DELETE', entite: 'individus', entiteId: req.params.id, req });
      return ApiResponse.success(res, null, 'Individu supprime');
    } catch (e) { next(e); }
  }
}

module.exports = new IndividuController();
