// ============================================
// CESUS - validators/menage.validator.js
// Valide les payloads menage envoyes par le web et le mobile Expo.
// ============================================
const Joi = require('joi');

const menageFields = {
  nomChef: Joi.string().trim().min(2).max(100).optional(),
  prenomChef: Joi.string().trim().min(2).max(100).optional(),
  chefMenage: Joi.string().trim().min(2).max(150).optional(),
  adresse: Joi.string().max(255).optional().allow(''),
  telephone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).optional().allow(''),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  zoneId: Joi.string().uuid().optional(),
  zone: Joi.string().trim().min(2).max(100).optional(),
  zoneNom: Joi.string().trim().min(2).max(100).optional(),
  region: Joi.string().trim().max(100).optional().allow(''),
  ville: Joi.string().trim().max(100).optional().allow(''),
  quartier: Joi.string().trim().max(100).optional().allow(''),
  nombreMembres: Joi.number().integer().min(0).max(1000).optional(),
  nbPersonnes: Joi.number().integer().min(1).max(1000).optional(),
  nbHommes: Joi.number().integer().min(0).max(1000).optional(),
  nbFemmes: Joi.number().integer().min(0).max(1000).optional(),
  nbEnfants: Joi.number().integer().min(0).max(1000).optional(),
  typeHabitation: Joi.string().max(100).optional().allow(''),
  nbPieces: Joi.number().integer().min(0).max(100).optional(),
  sourceEau: Joi.string().max(100).optional().allow(''),
  accesElectricite: Joi.string().max(50).optional().allow(''),
  typeToilettes: Joi.string().max(100).optional().allow(''),
  profession: Joi.string().max(100).optional().allow(''),
  revenu: Joi.string().max(100).optional().allow(''),
  observations: Joi.string().max(1000).optional().allow(''),
  agentId: Joi.string().uuid().optional(),
};

const createMenageSchema = Joi.object(menageFields)
  .or('chefMenage', 'nomChef')
  .or('zoneId', 'zone', 'zoneNom');

const updateMenageSchema = Joi.object(menageFields).min(1);

module.exports = { createMenageSchema, updateMenageSchema };
