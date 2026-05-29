// ============================================
// CESUS – validators/auth.validator.js
// ============================================
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis',
  }),
  motDePasse: Joi.string().min(6).optional().messages({
    'string.min': 'Mot de passe trop court',
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Mot de passe trop court',
  }),
}).or('motDePasse', 'password');

const registerSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(50).required(),
  prenom: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().trim().required(),
  motDePasse: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir majuscule, minuscule et chiffre',
    }),
  telephone: Joi.string().pattern(/^\+?[0-9]{9,15}$/).optional(),
  roleId: Joi.string().uuid().required(),
});

const registerAgentSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(50).optional(),
  prenom: Joi.string().trim().min(2).max(50).optional(),
  name: Joi.string().trim().min(2).max(120).optional(),
  email: Joi.string().email().lowercase().trim().required(),
  motDePasse: Joi.string()
    .min(6)
    .required()
    .messages({ 'any.required': 'Mot de passe requis' }),
  telephone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).optional(),
  zoneId: Joi.string().uuid().optional(),
}).or('nom', 'name');

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token requis',
  }),
});

const changePasswordSchema = Joi.object({
  ancienMotDePasse: Joi.string().required(),
  nouveauMotDePasse: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
});

module.exports = {
  loginSchema,
  registerSchema,
  registerAgentSchema,
  refreshSchema,
  changePasswordSchema,
};
