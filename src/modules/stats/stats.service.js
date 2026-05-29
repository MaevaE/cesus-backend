// ============================================
// CESUS – services/stats.service.js
// Dashboard statistique (F06)
// ============================================
const { prisma } = require('../../config/database');

class StatsService {
  /**
   * Statistiques globales pour le dashboard admin
   */
  async getDashboard() {
    const [
      totalMenages,
      totalIndividus,
      totalAgents,
      totalZones,
      repartitionSexe,
      repartitionEtude,
      menagesParZone,
      activiteAgents,
    ] = await Promise.all([
      prisma.menage.count({ where: { deletedAt: null } }),
      prisma.individu.count({ where: { deletedAt: null } }),
      prisma.agent.count(),
      prisma.zone.count({ where: { deletedAt: null } }),

      // Répartition hommes/femmes
      prisma.individu.groupBy({
        by: ['sexe'],
        where: { deletedAt: null },
        _count: { sexe: true },
      }),

      // Répartition niveau d'étude
      prisma.individu.groupBy({
        by: ['niveauEtude'],
        where: { deletedAt: null },
        _count: { niveauEtude: true },
      }),

      // Ménages par zone (top 10)
      prisma.zone.findMany({
        where: { deletedAt: null },
        select: {
          nom: true,
          _count: { select: { menages: true } },
        },
        orderBy: { menages: { _count: 'desc' } },
        take: 10,
      }),

      // Activité récente des agents (7 derniers jours)
      prisma.agent.findMany({
        include: {
          user: { select: { nom: true, prenom: true, email: true } },
          zone: { select: { nom: true } },
          _count: { select: { menagesRecenses: true } },
        },
        orderBy: { derniereActivite: 'desc' },
        take: 10,
      }),
    ]);

    // Calculs dérivés
    const masculin = repartitionSexe.find((r) => r.sexe === 'MASCULIN')?._count.sexe || 0;
    const feminin = repartitionSexe.find((r) => r.sexe === 'FEMININ')?._count.sexe || 0;

    return {
      totaux: {
        population: totalIndividus,
        menages: totalMenages,
        agents: totalAgents,
        zones: totalZones,
        moyenneMembresParMenage: totalMenages > 0
          ? (totalIndividus / totalMenages).toFixed(1)
          : 0,
      },
      demographie: {
        masculin,
        feminin,
        tauxMasculinite: totalIndividus > 0
          ? ((masculin / totalIndividus) * 100).toFixed(1)
          : 0,
      },
      niveauEtude: repartitionEtude.map((r) => ({
        niveau: r.niveauEtude || 'NON_RENSEIGNE',
        count: r._count.niveauEtude,
      })),
      menagesParZone: menagesParZone.map((z) => ({
        zone: z.nom,
        count: z._count.menages,
      })),
      activiteAgents: activiteAgents.map((a) => ({
        agent: `${a.user.prenom} ${a.user.nom}`,
        email: a.user.email,
        zone: a.zone?.nom || 'Non assigné',
        menagesRecenses: a._count.menagesRecenses,
        derniereActivite: a.derniereActivite,
      })),
    };
  }

  /**
   * Statistiques par zone
   */
  async getStatsByZone(zoneId) {
    const [menages, individus, repartitionSexe] = await Promise.all([
      prisma.menage.count({ where: { zoneId, deletedAt: null } }),
      prisma.individu.count({
        where: { menage: { zoneId }, deletedAt: null },
      }),
      prisma.individu.groupBy({
        by: ['sexe'],
        where: { menage: { zoneId }, deletedAt: null },
        _count: { sexe: true },
      }),
    ]);

    return { menages, individus, repartitionSexe };
  }

  /**
   * Progression des agents
   */
  async getAgentsProgress() {
    return prisma.agent.findMany({
      include: {
        user: { select: { nom: true, prenom: true } },
        zone: { select: { nom: true } },
        _count: { select: { menagesRecenses: true } },
      },
      orderBy: { menagesRecenses: { _count: 'desc' } },
    });
  }
}

module.exports = new StatsService();