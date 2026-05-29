// ============================================
// CESUS – repositories/individu.repository.js
// ============================================
const { prisma } = require('../../config/database');

class IndividuRepository {
  async findAll({ skip, take, menageId, agentId, search } = {}) {
    const where = {
      deletedAt: null,
      ...(menageId && { menageId }),
      ...(agentId && { menage: { agentId } }),
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { profession: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.individu.findMany({
        where,
        skip,
        take,
        include: { menage: { select: { id: true, codeUnique: true, nomChef: true } } },
        orderBy: [{ menageId: 'asc' }, { nom: 'asc' }],
      }),
      prisma.individu.count({ where }),
    ]);
    return { data, total };
  }

  async findByMenage(menageId, { skip, take } = {}) {
    const where = { menageId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.individu.findMany({ where, skip, take, orderBy: { nom: 'asc' } }),
      prisma.individu.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.individu.findFirst({
      where: { id, deletedAt: null },
      include: { menage: { select: { id: true, codeUnique: true, nomChef: true } } },
    });
  }

  async create(data) {
    return prisma.individu.create({ data });
  }

  async update(id, data) {
    return prisma.individu.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.individu.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

module.exports = new IndividuRepository();
