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

router.get('/', authorize('ADMIN', 'SUPERVISEUR'), agentController.list);
router.get('/me', authorize('AGENT', 'ADMIN'), agentController.me);
router.get('/me/dashboard', authorize('AGENT', 'ADMIN'), agentController.dashboard);
router.get('/me/mission', authorize('AGENT', 'ADMIN'), agentController.mission);
router.patch('/me/location', authorize('AGENT', 'ADMIN'), validate(updateLocationSchema), agentController.updateLocation);

module.exports = router;
