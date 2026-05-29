// ============================================
// CESUS – controllers/zone.controller.js
// ============================================
const zoneService = require('./zone.service');
const ApiResponse = require('../../utils/ApiResponse');

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
      return ApiResponse.created(res, zone, 'Zone créée');
    } catch (e) { next(e); }
  }

  async update(req, res, next) {
    try {
      const zone = await zoneService.update(req.params.id, req.body);
      return ApiResponse.success(res, zone, 'Zone mise à jour');
    } catch (e) { next(e); }
  }

  async delete(req, res, next) {
    try {
      await zoneService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Zone supprimée');
    } catch (e) { next(e); }
  }
}

module.exports = new ZoneController();