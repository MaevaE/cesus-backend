// ============================================
// CESUS – repositories/zone.repository.js
// ============================================
const { prisma } = require('../../config/database');

class ZoneRepository {
  /**
   * Recherche une zone active par son nom normalise.
   * @param {string} nom - Nom de la zone tel que saisi par le mobile ou le web.
   * @returns {Promise<object|null>} Zone trouvee ou null.
   */
  async findByName(nom) {
    return prisma.zone.findFirst({
      where: {
        nom: { equals: nom, mode: 'insensitive' },
        deletedAt: null,
      },
    });
  }

  async findAll({ skip, take, search } = {}) {
    const where = {
      deletedAt: null,
      ...(search && { nom: { contains: search, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      prisma.zone.findMany({
        where, skip, take,
        include: { _count: { select: { menages: true, agents: true } } },
        orderBy: { nom: 'asc' },
      }),
      prisma.zone.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.zone.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { menages: true, agents: true } } },
    });
  }

  async create(data) {
    return prisma.zone.create({ data });
  }

  async update(id, data) {
    return prisma.zone.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.zone.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

module.exports = new ZoneRepository();
