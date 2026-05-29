// ============================================
// CESUS – controllers/zone.controller.js
// ============================================
const zoneService = require('./zone.service');
const ApiResponse = require('../../utils/ApiResponse');
const { logAction } = require('../../utils/auditLog');

class ZoneController {
  async getAll(req, res, next) {
    try {
      const { data, total, page, limit } = await zoneService.getAll(req.query);
      return ApiResponse.paginated(res, data, total, page, limit);
    } catch (e) { next(e); }
  }

  async getById(req, res, next) {
    try {
      const zone = await zoneService.getById(req.params.id);
      return ApiResponse.success(res, zone);
    } catch (e) { next(e); }
  }

  async create(req, res, next) {
    try {
      const zone = await zoneService.create(req.body);
      await logAction({
        action: 'ZONE_CREATE',
        entite: 'zones',
        entiteId: zone.id,
        req,
        details: { nom: zone.nom },
      });
      return ApiResponse.created(res, zone, 'Zone créée');
    } catch (e) { next(e); }
  }

  async update(req, res, next) {
    try {
      const zone = await zoneService.update(req.params.id, req.body);
      await logAction({
        action: 'ZONE_UPDATE',
        entite: 'zones',
        entiteId: zone.id,
        req,
        details: { champs: Object.keys(req.body) },
      });
      return ApiResponse.success(res, zone, 'Zone mise à jour');
    } catch (e) { next(e); }
  }

  async delete(req, res, next) {
    try {
      await zoneService.delete(req.params.id);
      await logAction({ action: 'ZONE_DELETE', entite: 'zones', entiteId: req.params.id, req });
      return ApiResponse.success(res, null, 'Zone supprimée');
    } catch (e) { next(e); }
  }
}

module.exports = new ZoneController();
