// ============================================
// CESUS - validators/campagne.validator.js
// Valide les donnees de creation et modification des campagnes.
// ============================================
const Joi = require('joi');

const campagneFields = {
  nom: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().max(1000).optional().allow(''),
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().min(Joi.ref('dateDebut')).optional(),
  statut: Joi.string().valid('EN_COURS', 'TERMINEE', 'SUSPENDUE').optional(),
  zoneIds: Joi.array().items(Joi.string().uuid()).optional().default([]),
};

const createCampagneSchema = Joi.object(campagneFields);

const updateCampagneSchema = Joi.object({
  ...campagneFields,
  nom: campagneFields.nom.optional(),
  dateDebut: Joi.date().optional(),
}).min(1);

module.exports = { createCampagneSchema, updateCampagneSchema };
