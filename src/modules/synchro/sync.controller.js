// ============================================
// CESUS – controllers/sync.controller.js
// ============================================
const syncService = require('./sync.service');
const ApiResponse = require('../../utils/ApiResponse');
const { logAction } = require('../../utils/auditLog');

class SyncController {
  async sync(req, res, next) {
    try {
      const results = await syncService.syncBatch(req.body, req.user);
      await logAction({
        action: 'SYNC_BATCH',
        entite: 'sync',
        req,
        details: {
          created: results.created,
          updated: results.updated,
          errors: results.errors.length,
        },
      });
      return ApiResponse.success(res, results, 'Synchronisation terminée');
    } catch (e) { next(e); }
  }
}

module.exports = new SyncController();
