// ============================================
// CESUS – routes/menage.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const menageController = require('./menage.controller');
const individusRouter = require('../individus/individu.routes');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createMenageSchema, updateMenageSchema } = require('./menage.validator');

router.use(authenticate);

// Imbriquer les individus sous les ménages
router.use('/:menageId/individus', individusRouter);

router.get('/', menageController.getAll);
router.get('/:id', menageController.getById);
router.post('/', authorize('ADMIN', 'AGENT'), validate(createMenageSchema), menageController.create);
router.patch('/:id', authorize('ADMIN', 'AGENT'), validate(updateMenageSchema), menageController.update);
router.put('/:id', authorize('ADMIN', 'AGENT'), validate(updateMenageSchema), menageController.update);
router.delete('/:id', authorize('ADMIN', 'AGENT'), menageController.delete);

module.exports = router;
