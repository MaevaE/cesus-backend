// ============================================
// CESUS – routes/export.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const exportController = require('./export.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', exportController.exportDataset);
router.get('/menages', exportController.exportMenages);
router.get('/individus', exportController.exportIndividus);
router.get('/rapport', exportController.exportRapport);

module.exports = router;
