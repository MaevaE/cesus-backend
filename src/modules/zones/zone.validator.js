// ============================================
// CESUS – validators/zone.validator.js
// ============================================
const Joi = require('joi');

const createZoneSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  region: Joi.string().max(100).optional().allow(''),
  departement: Joi.string().max(100).optional().allow(''),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const updateZoneSchema = createZoneSchema.fork(
  ['nom'],
  (schema) => schema.optional()
);

module.exports = { createZoneSchema, updateZoneSchema };