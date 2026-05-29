// ============================================
// CESUS – services/zone.service.js
// ============================================
const zoneRepository = require('./zone.repository');
const { Errors } = require('../../utils/AppError');
const { getPagination } = require('../../utils/pagination');

class ZoneService {
  async getAll(query) {
    const { skip, take, page, limit } = getPagination(query);
    const { data, total } = await zoneRepository.findAll({ skip, take, search: query.search });
    return { data, total, page, limit };
  }

  async getById(id) {
    const zone = await zoneRepository.findById(id);
    if (!zone) throw Errors.notFound('Zone');
    return zone;
  }

  async create(data) {
    return zoneRepository.create(data);
  }

  /**
   * Retourne une zone existante ou la cree lorsque le mobile envoie un nom libre.
   * @param {object} data - Donnees minimales de zone.
   * @returns {Promise<object>} Zone utilisable pour rattacher un menage.
   */
  async findOrCreate(data) {
    const nom = data.nom?.trim();
    if (!nom) throw Errors.badRequest('Nom de zone requis');

    const existing = await zoneRepository.findByName(nom);
    if (existing) return existing;

    return zoneRepository.create({
      nom,
      region: data.region,
      departement: data.departement,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  }

  async update(id, data) {
    await this.getById(id);
    return zoneRepository.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    return zoneRepository.softDelete(id);
  }
}

module.exports = new ZoneService();
