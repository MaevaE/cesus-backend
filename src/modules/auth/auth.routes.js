// ============================================
// CESUS – routes/auth.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate, authorize } = require('../../middleware/Auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { authLimiter } = require('../../middleware/ratelimiter.middleware');
const {
  loginSchema,
  registerSchema,
  registerAgentSchema,
  refreshSchema,
  changePasswordSchema,
} = require('./auth.validator');

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/v1/auth/register  [ADMIN uniquement]
router.post(
  '/register',
  authenticate,
  authorize('ADMIN'),
  validate(registerSchema),
  authController.register
);

// POST /api/v1/auth/register-agent - auto-inscription agent pour le MVP mobile.
router.post('/register-agent', validate(registerAgentSchema), authController.registerAgent);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.me);

// PATCH /api/v1/auth/change-password
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
