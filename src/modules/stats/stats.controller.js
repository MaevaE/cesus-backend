// ============================================
// CESUS – controllers/stats.controller.js
// ============================================
const statsService = require('./stats.service');
const ApiResponse = require('../../utils/ApiResponse');

class StatsController {
  async getDashboard(req, res, next) {
    try {
      const stats = await statsService.getDashboard();
      return ApiResponse.success(res, stats, 'Dashboard récupéré');
    } catch (e) { next(e); }
  }

  async getByZone(req, res, next) {
    try {
      const stats = await statsService.getStatsByZone(req.params.zoneId);
      return ApiResponse.success(res, stats);
    } catch (e) { next(e); }
  }

  async getAgentsProgress(req, res, next) {
    try {
      const agents = await statsService.getAgentsProgress();
      return ApiResponse.success(res, agents);
    } catch (e) { next(e); }
  }
}

module.exports = new StatsController();