// ============================================
// CESUS – repositories/menage.repository.js
// ============================================
const { prisma } = require('../../config/database');

class MenageRepository {
  async findAll({ skip, take, zoneId, agentId, search } = {}) {
    const where = {
      deletedAt: null,
      ...(zoneId && { zoneId }),
      ...(agentId && { agentId }),
      ...(search && {
        OR: [
          { nomChef: { contains: search, mode: 'insensitive' } },
          { prenomChef: { contains: search, mode: 'insensitive' } },
          { codeUnique: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.menage.findMany({
        where, skip, take,
        include: {
          zone: { select: { id: true, nom: true } },
          agent: { include: { user: { select: { nom: true, prenom: true } } } },
          _count: { select: { individus: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.menage.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.menage.findFirst({
      where: { id, deletedAt: null },
      include: {
        zone: true,
        agent: { include: { user: { select: { nom: true, prenom: true, email: true } } } },
        individus: { where: { deletedAt: null }, orderBy: { nom: 'asc' } },
      },
    });
  }

  async create(data) {
    return prisma.menage.create({
      data,
      include: { zone: true },
    });
  }

  async update(id, data) {
    return prisma.menage.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.menage.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async updateNombreMembres(menageId) {
    const count = await prisma.individu.count({
      where: { menageId, deletedAt: null },
    });
    return prisma.menage.update({
      where: { id: menageId },
      data: { nombreMembres: count },
    });
  }
}

module.exports = new MenageRepository();