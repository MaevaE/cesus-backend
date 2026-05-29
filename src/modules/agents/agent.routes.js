// ============================================
// CESUS - routes/agent.routes.js
// Expose les endpoints consommes par l'application mobile de l'agent.
// ============================================
const express = require('express');
const router = express.Router();
const agentController = require('./agent.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { updateLocationSchema } = require('./agent.validator');

router.use(authenticate);
router.use(authorize('AGENT', 'ADMIN'));

router.get('/me', agentController.me);
router.get('/me/dashboard', agentController.dashboard);
router.get('/me/mission', agentController.mission);
router.patch('/me/location', validate(updateLocationSchema), agentController.updateLocation);

module.exports = router;
