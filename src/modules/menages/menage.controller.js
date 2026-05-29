// ============================================
// CESUS – controllers/menage.controller.js
// ============================================
const menageService = require('./menage.service');
const ApiResponse = require('../../utils/ApiResponse');
const { logAction } = require('../../utils/auditLog');

class MenageController {
  async getAll(req, res, next) {
    try {
      const { data, total, page, limit } = await menageService.getAll(req.query, req.user);
      return ApiResponse.paginated(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  async getById(req, res, next) {
    try {
      const menage = await menageService.getById(req.params.id, req.user);
      return ApiResponse.success(res, menage);
    } catch (e) { next(e); }
  }

  async create(req, res, next) {
    try {
      const menage = await menageService.create(req.body, req.user);
      await logAction({
        action: 'MENAGE_CREATE',
        entite: 'menages',
        entiteId: menage.id,
        req,
        details: { codeUnique: menage.codeUnique, zoneId: menage.zoneId },
      });
      return ApiResponse.created(res, menage, 'Ménage enregistré');
    } catch (e) { next(e); }
  }

  async update(req, res, next) {
    try {
      const menage = await menageService.update(req.params.id, req.body, req.user);
      await logAction({
        action: 'MENAGE_UPDATE',
        entite: 'menages',
        entiteId: menage.id,
        req,
        details: { champs: Object.keys(req.body) },
      });
      return ApiResponse.success(res, menage, 'Ménage mis à jour');
    } catch (e) { next(e); }
  }

  async delete(req, res, next) {
    try {
      await menageService.delete(req.params.id, req.user);
      await logAction({ action: 'MENAGE_DELETE', entite: 'menages', entiteId: req.params.id, req });
      return ApiResponse.success(res, null, 'Ménage supprimé');
    } catch (e) { next(e); }
  }
}

module.exports = new MenageController();
