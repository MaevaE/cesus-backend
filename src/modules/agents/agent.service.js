// ============================================
// CESUS - services/agent.service.js
// Fournit les donnees terrain utiles au mobile agent.
// ============================================
const { prisma } = require('../../config/database');
const { AppError, Errors } = require('../../utils/AppError');

class AgentService {
  /**
   * Liste les agents avec leurs compteurs de progression.
   * @returns {Promise<Array>} Agents et progression de collecte.
   */
  async listWithProgress() {
    const agents = await prisma.agent.findMany({
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true, telephone: true, actif: true } },
        zone: true,
        _count: { select: { menagesRecenses: true } },
      },
      orderBy: { derniereActivite: 'desc' },
    });

    return agents.map((agent) => ({
      ...agent,
      progression: {
        menagesRecenses: agent._count.menagesRecenses,
        objectif: 100,
        pourcentage: Math.min(100, Math.round((agent._count.menagesRecenses / 100) * 100)),
      },
    }));
  }

  /**
   * Recupere le profil agent associe a l'utilisateur connecte.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} Agent avec zone et compteurs.
   */
  async getCurrentAgent(user) {
    const agent = await prisma.agent.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        zone: true,
        _count: { select: { menagesRecenses: true } },
      },
    });

    if (!agent) throw new AppError('Profil agent introuvable', 400, 'AGENT_NOT_FOUND');
    return agent;
  }

  /**
   * Retourne les indicateurs de tableau de bord pour l'agent mobile.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} KPIs agent.
   */
  async getDashboard(user) {
    const agent = await this.getCurrentAgent(user);
    const [menages, individus, zones] = await Promise.all([
      prisma.menage.count({ where: { agentId: agent.id, deletedAt: null } }),
      prisma.individu.count({ where: { menage: { agentId: agent.id }, deletedAt: null } }),
      prisma.zone.count({ where: { agents: { some: { id: agent.id } }, deletedAt: null } }),
    ]);

    return {
      population: individus,
      menages,
      zones,
      aujourdHui: menages,
      couverture: agent.zone ? Math.min(100, Math.round((menages / 100) * 100)) : 0,
      derniereActivite: agent.derniereActivite,
      zone: agent.zone,
    };
  }

  /**
   * Retourne la mission courante de l'agent.
   * @param {object} user - Utilisateur authentifie.
   * @returns {Promise<object>} Mission derivee de la zone assignee.
   */
  async getMission(user) {
    const agent = await this.getCurrentAgent(user);
    if (!agent.zone) throw Errors.notFound('Zone assignee');

    return {
      id: agent.zone.id,
      zone: agent.zone.nom,
      city: agent.zone.departement || '',
      district: agent.zone.region || '',
      supervisor: null,
      progress: Math.min(100, agent._count.menagesRecenses),
      households: Math.max(100, agent._count.menagesRecenses),
      completed: agent._count.menagesRecenses,
      remaining: Math.max(0, 100 - agent._count.menagesRecenses),
      latitude: agent.zone.latitude,
      longitude: agent.zone.longitude,
      radius: 500,
    };
  }

  /**
   * Met a jour la derniere position GPS de l'agent.
   * @param {object} user - Utilisateur authentifie.
   * @param {object} location - { latitude, longitude }.
   * @returns {Promise<object>} Agent mis a jour.
   */
  async updateLocation(user, location) {
    const agent = await this.getCurrentAgent(user);
    return prisma.agent.update({
      where: { id: agent.id },
      data: {
        latitudeDernier: location.latitude,
        longitudeDernier: location.longitude,
        derniereActivite: new Date(),
      },
      include: {
        zone: true,
        user: { select: { nom: true, prenom: true, email: true } },
      },
    });
  }
}

module.exports = new AgentService();
