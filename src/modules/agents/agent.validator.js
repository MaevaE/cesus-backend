// ============================================
// CESUS - validators/agent.validator.js
// Valide la position GPS envoyee par le mobile.
// ============================================
const Joi = require('joi');

const updateLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

module.exports = { updateLocationSchema };
