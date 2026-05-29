// ============================================
// CESUS – controllers/sync.controller.js
// ============================================
const syncService = require('./sync.service');
const ApiResponse = require('../../utils/ApiResponse');

class SyncController {
  async sync(req, res, next) {
    try {
      const results = await syncService.syncBatch(req.body, req.user);
      return ApiResponse.success(res, results, 'Synchronisation terminée');
    } catch (e) { next(e); }
  }
}

module.exports = new SyncController();