// ============================================
// CESUS - services/menage.service.js
// Porte la logique metier des menages et l'adaptation du payload mobile.
// ============================================
const menageRepository = require('./menage.repository');
const zoneService = require('../zones/zone.service');
const { prisma } = require('../../config/database');
const { Errors, AppError } = require('../../utils/AppError');
const { getPagination } = require('../../utils/pagination');
const { generateMenageCode } = require('../../utils/generatecode');

class MenageService {
  /**
   * Transforme les champs envoyes par le mobile en colonnes du modele Menage.
   * @param {object} data - Payload valide par Joi.
   * @returns {{menage: object, zoneInput: object|null, agentId: string|undefined}}
   */
  normalizeInput(data) {
    const fullName = data.chefMenage?.trim();
    const parts = fullName ? fullName.split(/\s+/) : [];
    const hasChef = Boolean(data.nomChef || data.prenomChef || fullName);
    const prenomChef = data.prenomChef || (parts.length > 1 ? parts.shift() : undefined);
    const nomChef = data.nomChef || (parts.length ? parts.join(' ') : fullName);
    const adresse = data.adresse || [data.quartier, data.ville, data.region].filter(Boolean).join(', ');
    const zoneName = data.zoneNom || data.zone;

    return {
      menage: {
        nomChef: hasChef ? nomChef : undefined,
        prenomChef: hasChef ? (prenomChef || '-') : undefined,
        adresse: adresse || null,
        latitude: data.latitude,
        longitude: data.longitude,
        zoneId: data.zoneId,
        nombreMembres: data.nombreMembres ?? data.nbPersonnes ?? 0,
      },
      zoneInput: zoneName
        ? {
            nom: zoneName,
            region: data.region,
            departement: data.ville,
            latitude: data.latitude,
            longitude: data.longitude,
          }
        : null,
      agentId: data.agentId,
    };
  }

  /**
   * Liste les menages pagines. Les agents ne voient que leurs propres menages.
   * @param {object} query - Filtres de recherche et pagination.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} Donnees paginees.
   */
  async getAll(query, user) {
    const { skip, take, page, limit } = getPagination(query);
    const filters = { skip, take, search: query.search, zoneId: query.zoneId };

    if (user.role.nom === 'AGENT') {
      filters.agentId = user.agent?.id;
    }

    const { data, total } = await menageRepository.findAll(filters);
    return { data, total, page, limit };
  }

  /**
   * Retourne un menage detaille et verifie l'appartenance pour un agent.
   * @param {string} id - Identifiant du menage.
   * @param {object|null} user - Utilisateur authentifie.
   * @returns {Promise<object>} Menage detaille.
   */
  async getById(id, user = null) {
    const menage = await menageRepository.findById(id);
    if (!menage) throw Errors.notFound('Menage');

    if (user?.role?.nom === 'AGENT' && menage.agent.userId !== user.id) {
      throw Errors.forbidden('Vous ne pouvez consulter que vos propres menages');
    }

    return menage;
  }

  /**
   * Cree un menage depuis le web ou le formulaire mobile.
   * @param {object} data - Donnees du menage.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} Menage cree.
   */
  async create(data, user) {
    const normalized = this.normalizeInput(data);
    let zone = null;

    if (normalized.menage.zoneId) {
      zone = await zoneService.getById(normalized.menage.zoneId);
    } else if (normalized.zoneInput) {
      zone = await zoneService.findOrCreate(normalized.zoneInput);
      normalized.menage.zoneId = zone.id;
    }

    if (!zone) throw Errors.notFound('Zone');

    const agent = user.role.nom === 'AGENT'
      ? await prisma.agent.findUnique({ where: { userId: user.id } })
      : await prisma.agent.findUnique({ where: { id: normalized.agentId || user.agent?.id || '' } });

    if (!agent) throw new AppError('Profil agent introuvable', 400, 'AGENT_NOT_FOUND');

    return menageRepository.create({
      ...normalized.menage,
      agentId: agent.id,
      codeUnique: generateMenageCode(zone.nom),
      statut: 'SYNCHRONISE',
    });
  }

  /**
   * Met a jour un menage existant.
   * @param {string} id - Identifiant du menage.
   * @param {object} data - Champs a modifier.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} Menage modifie.
   */
  async update(id, data, user) {
    await this.getById(id, user);
    const normalized = this.normalizeInput(data);

    if (normalized.zoneInput && !normalized.menage.zoneId) {
      const zone = await zoneService.findOrCreate(normalized.zoneInput);
      normalized.menage.zoneId = zone.id;
    }

    Object.keys(normalized.menage).forEach((key) => {
      if (normalized.menage[key] === undefined) delete normalized.menage[key];
    });

    return menageRepository.update(id, normalized.menage);
  }

  /**
   * Supprime logiquement un menage.
   * @param {string} id - Identifiant du menage.
   * @returns {Promise<object>} Menage supprime.
   */
  async delete(id) {
    await this.getById(id);
    return menageRepository.softDelete(id);
  }
}

module.exports = new MenageService();
