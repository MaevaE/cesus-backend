// ============================================
// CESUS – routes/stats.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const statsController = require('./stats.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERVISEUR'));

router.get('/dashboard', statsController.getDashboard);
router.get('/agents', statsController.getAgentsProgress);
router.get('/zones/:zoneId', statsController.getByZone);

module.exports = router;