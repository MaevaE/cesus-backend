// ============================================
// CESUS - routes/zone.routes.js
// Expose les endpoints de gestion des zones de recensement.
// ============================================
const express = require('express');
const router = express.Router();
const zoneController = require('./one.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createZoneSchema, updateZoneSchema } = require('./zone.validator');

router.use(authenticate);

// GET /api/v1/zones - liste paginee des zones accessibles aux utilisateurs connectes.
router.get('/', zoneController.getAll);

// GET /api/v1/zones/:id - detail d'une zone avec compteurs menages/agents.
router.get('/:id', zoneController.getById);

// POST /api/v1/zones - creation d'une zone, reservee a l'administrateur.
router.post('/', authorize('ADMIN'), validate(createZoneSchema), zoneController.create);

// PATCH /api/v1/zones/:id - modification d'une zone, reservee a l'administrateur.
router.patch('/:id', authorize('ADMIN'), validate(updateZoneSchema), zoneController.update);
router.put('/:id', authorize('ADMIN'), validate(updateZoneSchema), zoneController.update);

// DELETE /api/v1/zones/:id - suppression logique d'une zone, reservee a l'administrateur.
router.delete('/:id', authorize('ADMIN'), zoneController.delete);

module.exports = router;
