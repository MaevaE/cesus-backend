// ============================================
// CESUS - services/sync.service.js
// Synchronise les donnees collectees hors connexion par le mobile.
// ============================================
const { prisma } = require('../../config/database');
const { generateMenageCode } = require('../../utils/generatecode');
const { AppError } = require('../../utils/AppError');
const logger = require('../../config/logger');

class SyncService {
  /**
   * Retourne une zone existante ou la cree dans la transaction de synchronisation.
   * @param {object} tx - Client transactionnel Prisma.
   * @param {object} data - Donnees du menage contenant zoneId ou nom de zone.
   * @returns {Promise<object>} Zone resolue.
   */
  async resolveZone(tx, data) {
    if (data.zoneId) {
      const zone = await tx.zone.findFirst({ where: { id: data.zoneId, deletedAt: null } });
      if (!zone) throw new AppError('Zone introuvable', 404, 'ZONE_NOT_FOUND');
      return zone;
    }

    const nom = data.zoneNom || data.zone;
    if (!nom) throw new AppError('zoneId ou zone requis', 400, 'ZONE_REQUIRED');

    const existing = await tx.zone.findFirst({
      where: { nom: { equals: nom, mode: 'insensitive' }, deletedAt: null },
    });
    if (existing) return existing;

    return tx.zone.create({
      data: {
        nom,
        region: data.region,
        departement: data.ville,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  /**
   * Convertit un menage mobile en donnees persistables.
   * @param {object} data - Payload mobile.
   * @param {object} zone - Zone rattachee.
   * @param {string} agentId - Agent connecte.
   * @returns {object} Donnees Prisma.
   */
  normalizeMenage(data, zone, agentId) {
    const fullName = data.chefMenage?.trim();
    const parts = fullName ? fullName.split(/\s+/) : [];
    const prenomChef = data.prenomChef || (parts.length > 1 ? parts.shift() : '-');
    const nomChef = data.nomChef || (parts.length ? parts.join(' ') : fullName);

    return {
      nomChef,
      prenomChef,
      adresse: data.adresse || [data.quartier, data.ville, data.region].filter(Boolean).join(', ') || null,
      latitude: data.latitude,
      longitude: data.longitude,
      zoneId: zone.id,
      agentId,
      nombreMembres: data.nombreMembres ?? data.nbPersonnes ?? 0,
      codeUnique: data.codeUnique || generateMenageCode(zone.nom),
      statut: 'SYNCHRONISE',
    };
  }

  /**
   * Synchronise un lot de menages et d'individus.
   * @param {object} payload - { menages, individus, agentLocation }
   * @param {object} user - Utilisateur connecte.
   * @returns {Promise<object>} Resume et mapping local vers serveur.
   */
  async syncBatch(payload, user) {
    const { menages = [], individus = [], agentLocation = null } = payload;
    const results = {
      created: 0,
      updated: 0,
      errors: [],
      menages: [],
      individus: [],
    };
    const menageIdMap = new Map();

    const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
    if (!agent) throw new AppError('Profil agent introuvable', 400, 'AGENT_NOT_FOUND');

    await prisma.$transaction(async (tx) => {
      if (agentLocation?.latitude && agentLocation?.longitude) {
        await tx.agent.update({
          where: { id: agent.id },
          data: {
            latitudeDernier: agentLocation.latitude,
            longitudeDernier: agentLocation.longitude,
            derniereActivite: new Date(),
          },
        });
      }

      for (const menageData of menages) {
        try {
          const { localId, serverId, individus: _ignored, ...data } = menageData;
          const zone = await this.resolveZone(tx, data);
          const prismaData = this.normalizeMenage(data, zone, agent.id);

          let saved;
          if (serverId) {
            saved = await tx.menage.update({
              where: { id: serverId },
              data: {
                ...prismaData,
                codeUnique: undefined,
              },
            });
            results.updated++;
          } else {
            saved = await tx.menage.create({ data: prismaData });
            results.created++;
          }

          if (localId) menageIdMap.set(localId, saved.id);
          results.menages.push({ localId, serverId: saved.id });
        } catch (err) {
          results.errors.push({ type: 'menage', localId: menageData.localId, error: err.message });
        }
      }

      for (const individuData of individus) {
        try {
          const { localId, localMenageId, serverId, ...data } = individuData;
          const menageId = data.menageId || menageIdMap.get(localMenageId);
          if (!menageId) throw new AppError('menageId introuvable pour individu', 400, 'MENAGE_ID_REQUIRED');

          let saved;
          if (serverId) {
            saved = await tx.individu.update({
              where: { id: serverId },
              data: { ...data, menageId, statut: 'SYNCHRONISE' },
            });
            results.updated++;
          } else {
            saved = await tx.individu.create({
              data: { ...data, menageId, statut: 'SYNCHRONISE' },
            });
            results.created++;
          }

          results.individus.push({ localId, serverId: saved.id, menageId });
        } catch (err) {
          results.errors.push({ type: 'individu', localId: individuData.localId, error: err.message });
        }
      }

      const touchedMenageIds = [
        ...new Set([
          ...results.menages.map((m) => m.serverId).filter(Boolean),
          ...results.individus.map((i) => i.menageId).filter(Boolean),
        ]),
      ];

      for (const menageId of touchedMenageIds) {
        const count = await tx.individu.count({ where: { menageId, deletedAt: null } });
        await tx.menage.update({ where: { id: menageId }, data: { nombreMembres: count } });
      }
    });

    logger.info(`Sync agent ${user.email}: +${results.created}, ~${results.updated}, erreurs=${results.errors.length}`);
    return results;
  }
}

module.exports = new SyncService();
