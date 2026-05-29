// ============================================
// CESUS - routes/campagne.routes.js
// Expose les endpoints REST de gestion des campagnes.
// ============================================
const express = require('express');
const router = express.Router();
const campagneController = require('./campagne.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createCampagneSchema, updateCampagneSchema } = require('./campagne.validator');

router.use(authenticate);

// GET /api/v1/campagnes - liste les campagnes pour le tableau de bord.
router.get('/', authorize('ADMIN', 'SUPERVISEUR'), campagneController.getAll);

// GET /api/v1/campagnes/:id - detail d'une campagne.
router.get('/:id', authorize('ADMIN', 'SUPERVISEUR'), campagneController.getById);

// POST /api/v1/campagnes - cree une campagne.
router.post('/', authorize('ADMIN'), validate(createCampagneSchema), campagneController.create);

// PATCH/PUT /api/v1/campagnes/:id - modifie une campagne.
router.patch('/:id', authorize('ADMIN'), validate(updateCampagneSchema), campagneController.update);
router.put('/:id', authorize('ADMIN'), validate(updateCampagneSchema), campagneController.update);

// DELETE /api/v1/campagnes/:id - supprime logiquement une campagne.
router.delete('/:id', authorize('ADMIN'), campagneController.delete);

module.exports = router;
