// ============================================
// CESUS - services/campagne.service.js
// Porte la logique metier de gestion des campagnes de recensement.
// ============================================
const { prisma } = require('../../config/database');
const { Errors } = require('../../utils/AppError');
const { getPagination } = require('../../utils/pagination');

class CampagneService {
  /**
   * @description Liste les campagnes avec pagination et zones associees.
   * @param {Object} query - Parametres de recherche et de pagination.
   * @returns {Promise<Object>} Liste paginee des campagnes.
   */
  async getAll(query) {
    const { skip, take, page, limit } = getPagination(query);
    const where = {
      deletedAt: null,
      ...(query.search && { nom: { contains: query.search, mode: 'insensitive' } }),
      ...(query.statut && { statut: query.statut }),
    };

    const [data, total] = await Promise.all([
      prisma.campagne.findMany({
        where,
        skip,
        take,
        include: {
          zones: { include: { zone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campagne.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * @description Recupere une campagne par son identifiant.
   * @param {string} id - Identifiant de campagne.
   * @returns {Promise<Object>} Campagne trouvee.
   */
  async getById(id) {
    const campagne = await prisma.campagne.findFirst({
      where: { id, deletedAt: null },
      include: { zones: { include: { zone: true } } },
    });

    if (!campagne) throw Errors.notFound('Campagne');
    return campagne;
  }

  /**
   * @description Cree une campagne et rattache les zones envoyees.
   * @param {Object} data - Donnees validees de campagne.
   * @returns {Promise<Object>} Campagne creee.
   */
  async create(data) {
    const { zoneIds = [], ...campagneData } = data;

    return prisma.campagne.create({
      data: {
        ...campagneData,
        zones: zoneIds.length
          ? { create: zoneIds.map((zoneId) => ({ zoneId })) }
          : undefined,
      },
      include: { zones: { include: { zone: true } } },
    });
  }

  /**
   * @description Met a jour une campagne et remplace les zones si zoneIds est fourni.
   * @param {string} id - Identifiant de campagne.
   * @param {Object} data - Champs a modifier.
   * @returns {Promise<Object>} Campagne mise a jour.
   */
  async update(id, data) {
    await this.getById(id);
    const { zoneIds, ...campagneData } = data;

    return prisma.$transaction(async (tx) => {
      if (Array.isArray(zoneIds)) {
        await tx.campagneZone.deleteMany({ where: { campagneId: id } });
      }

      return tx.campagne.update({
        where: { id },
        data: {
          ...campagneData,
          ...(Array.isArray(zoneIds) && zoneIds.length
            ? { zones: { create: zoneIds.map((zoneId) => ({ zoneId })) } }
            : {}),
        },
        include: { zones: { include: { zone: true } } },
      });
    });
  }

  /**
   * @description Supprime logiquement une campagne.
   * @param {string} id - Identifiant de campagne.
   * @returns {Promise<Object>} Campagne supprimee.
   */
  async delete(id) {
    await this.getById(id);
    return prisma.campagne.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new CampagneService();
