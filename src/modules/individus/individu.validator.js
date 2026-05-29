// ============================================
// CESUS - validators/individu.validator.js
// Valide les donnees demographiques des individus.
// ============================================
const Joi = require('joi');

const individuFields = {
  nom: Joi.string().trim().min(2).max(100).optional(),
  prenom: Joi.string().trim().min(2).max(100).optional(),
  sexe: Joi.string().valid('MASCULIN', 'FEMININ').optional(),
  dateNaissance: Joi.date().max('now').optional(),
  age: Joi.number().integer().min(0).max(150).optional(),
  profession: Joi.string().max(100).optional().allow(''),
  niveauEtude: Joi.string()
    .valid('AUCUN', 'PRIMAIRE', 'SECONDAIRE', 'SUPERIEUR', 'FORMATION_PRO')
    .optional(),
  lienChef: Joi.string().max(50).optional().allow(''),
  menageId: Joi.string().uuid().optional(),
};

const createIndividuSchema = Joi.object(individuFields)
  .fork(['nom', 'prenom', 'sexe'], (schema) => schema.required())
  .or('dateNaissance', 'age');

const updateIndividuSchema = Joi.object(individuFields).min(1);

module.exports = { createIndividuSchema, updateIndividuSchema };
