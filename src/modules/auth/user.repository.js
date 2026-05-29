// ============================================
// CESUS – repositories/user.repository.js
// Principe D de SOLID : couche d'accès aux données
// ============================================
const { prisma } = require('../../config/database');

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true, agent: true },
    });
  }

  async findById(id) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, agent: true },
    });
  }

  async findAll({ skip, take, search } = {}) {
    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async create(data) {
    return prisma.user.create({
      data,
      include: { role: true, agent: true },
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), actif: false },
    });
  }

  async saveRefreshToken(userId, token, expiresAt) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });
  }

  async revokeRefreshToken(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}

module.exports = new UserRepository();
