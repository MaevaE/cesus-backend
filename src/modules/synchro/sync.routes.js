// ============================================
// CESUS – routes/sync.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const syncController = require('./sync.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { syncSchema } = require('./sync.validator');

router.use(authenticate);
router.post('/', authorize('AGENT', 'ADMIN'), validate(syncSchema), syncController.sync);

module.exports = router;
