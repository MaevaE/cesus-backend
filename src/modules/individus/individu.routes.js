// ============================================
// CESUS - routes/individu.routes.js
// Expose les routes directes et imbriquees des individus.
// ============================================
const express = require('express');
const router = express.Router({ mergeParams: true });
const individuController = require('./individu.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createIndividuSchema, updateIndividuSchema } = require('./individu.validator');

router.use(authenticate);

// GET /api/v1/individus ou /api/v1/menages/:menageId/individus.
router.get('/', (req, res, next) => {
  if (req.params.menageId) return individuController.getByMenage(req, res, next);
  return individuController.getAll(req, res, next);
});

// POST /api/v1/individus ou /api/v1/menages/:menageId/individus.
router.post('/', authorize('ADMIN', 'AGENT'), validate(createIndividuSchema), individuController.create);

// GET /api/v1/individus/:id - detail direct.
router.get('/:id', individuController.getById);

// PATCH /api/v1/individus/:id - modification directe.
router.patch('/:id', authorize('ADMIN', 'AGENT'), validate(updateIndividuSchema), individuController.update);

// DELETE /api/v1/individus/:id - suppression directe.
router.delete('/:id', authorize('ADMIN'), individuController.delete);

module.exports = router;
