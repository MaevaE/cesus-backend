// ============================================
// CESUS - validators/sync.validator.js
// Valide le lot de synchronisation hors ligne envoye par le mobile.
// ============================================
const Joi = require('joi');

const syncMenageSchema = Joi.object({
  localId: Joi.string().optional(),
  serverId: Joi.string().uuid().optional(),
  codeUnique: Joi.string().optional(),
  nomChef: Joi.string().min(2).optional(),
  prenomChef: Joi.string().min(1).optional(),
  chefMenage: Joi.string().min(2).optional(),
  adresse: Joi.string().allow('').optional(),
  telephone: Joi.string().allow('').optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  zoneId: Joi.string().uuid().optional(),
  zone: Joi.string().min(2).optional(),
  zoneNom: Joi.string().min(2).optional(),
  region: Joi.string().allow('').optional(),
  ville: Joi.string().allow('').optional(),
  quartier: Joi.string().allow('').optional(),
  nombreMembres: Joi.number().integer().min(0).optional(),
  nbPersonnes: Joi.number().integer().min(0).optional(),
}).or('nomChef', 'chefMenage').or('zoneId', 'zone', 'zoneNom');

const syncIndividuSchema = Joi.object({
  localId: Joi.string().optional(),
  localMenageId: Joi.string().optional(),
  serverId: Joi.string().uuid().optional(),
  menageId: Joi.string().uuid().optional(),
  nom: Joi.string().min(2).required(),
  prenom: Joi.string().min(2).required(),
  sexe: Joi.string().valid('MASCULIN', 'FEMININ').required(),
  dateNaissance: Joi.date().max('now').optional(),
  age: Joi.number().integer().min(0).max(150).optional(),
  profession: Joi.string().allow('').optional(),
  niveauEtude: Joi.string()
    .valid('AUCUN', 'PRIMAIRE', 'SECONDAIRE', 'SUPERIEUR', 'FORMATION_PRO')
    .optional(),
  lienChef: Joi.string().allow('').optional(),
}).or('menageId', 'localMenageId').or('dateNaissance', 'age');

const syncSchema = Joi.object({
  menages: Joi.array().items(syncMenageSchema).default([]),
  individus: Joi.array().items(syncIndividuSchema).default([]),
  agentLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).optional(),
}).or('menages', 'individus', 'agentLocation');

module.exports = { syncSchema };
