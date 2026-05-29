// ============================================
// CESUS - services/individu.service.js
// Gere les individus rattaches aux menages et les compteurs de membres.
// ============================================
const individuRepository = require('./individu.repository');
const menageRepository = require('../../modules/menages/menage.repository');
const { Errors } = require('../../utils/AppError');
const { getPagination } = require('../../utils/pagination');

class IndividuService {
  /**
   * Liste tous les individus visibles par l'utilisateur.
   * @param {object} query - Filtres et pagination.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} Resultat pagine.
   */
  async getAll(query, user) {
    const { skip, take, page, limit } = getPagination(query);
    const filters = { skip, take, menageId: query.menageId, search: query.search };

    if (user.role.nom === 'AGENT') {
      filters.agentId = user.agent?.id;
    }

    const { data, total } = await individuRepository.findAll(filters);
    return { data, total, page, limit };
  }

  /**
   * Liste les individus d'un menage.
   * @param {string} menageId - Identifiant du menage.
   * @param {object} query - Pagination.
   * @param {object|null} user - Utilisateur authentifie.
   * @returns {Promise<object>} Resultat pagine.
   */
  async getByMenage(menageId, query, user = null) {
    const menage = await menageRepository.findById(menageId);
    if (!menage) throw Errors.notFound('Menage');
    if (user?.role?.nom === 'AGENT' && menage.agent.userId !== user.id) {
      throw Errors.forbidden('Vous ne pouvez consulter que vos propres menages');
    }

    const { skip, take, page, limit } = getPagination(query);
    const { data, total } = await individuRepository.findByMenage(menageId, { skip, take });
    return { data, total, page, limit };
  }

  /**
   * Retourne un individu par identifiant.
   * @param {string} id - Identifiant de l'individu.
   * @param {object|null} user - Utilisateur authentifie.
   * @returns {Promise<object>} Individu detaille.
   */
  async getById(id, user = null) {
    const individu = await individuRepository.findById(id);
    if (!individu) throw Errors.notFound('Individu');

    if (user?.role?.nom === 'AGENT') {
      const menage = await menageRepository.findById(individu.menageId);
      if (menage.agent.userId !== user.id) {
        throw Errors.forbidden('Vous ne pouvez consulter que vos propres individus');
      }
    }

    return individu;
  }

  /**
   * Cree un individu dans un menage donne.
   * @param {string|undefined} menageIdFromParams - Menage venant de l'URL imbriquee.
   * @param {object} data - Donnees de l'individu.
   * @param {object|null} user - Utilisateur authentifie.
   * @returns {Promise<object>} Individu cree.
   */
  async create(menageIdFromParams, data, user = null) {
    const menageId = menageIdFromParams || data.menageId;
    if (!menageId) throw Errors.badRequest('menageId requis');

    const menage = await menageRepository.findById(menageId);
    if (!menage) throw Errors.notFound('Menage');
    if (user?.role?.nom === 'AGENT' && menage.agent.userId !== user.id) {
      throw Errors.forbidden('Vous ne pouvez modifier que vos propres menages');
    }

    const { menageId: _ignored, ...payload } = data;
    const individu = await individuRepository.create({
      ...payload,
      menageId,
      statut: 'SYNCHRONISE',
    });

    await menageRepository.updateNombreMembres(menageId);
    return individu;
  }

  /**
   * Met a jour un individu existant.
   * @param {string} id - Identifiant de l'individu.
   * @param {object} data - Champs a modifier.
   * @param {object|null} user - Utilisateur authentifie.
   * @returns {Promise<object>} Individu modifie.
   */
  async update(id, data, user = null) {
    await this.getById(id, user);
    const { menageId: _ignored, ...payload } = data;
    return individuRepository.update(id, payload);
  }

  /**
   * Supprime logiquement un individu et recalcule le nombre de membres du menage.
   * @param {string} id - Identifiant de l'individu.
   * @param {object|null} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   */
  async delete(id, user = null) {
    const individu = await this.getById(id, user);
    await individuRepository.softDelete(id);
    await menageRepository.updateNombreMembres(individu.menageId);
  }
}

module.exports = new IndividuService();
