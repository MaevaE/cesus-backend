// ============================================
// CESUS – services/export.service.js
// Export CSV et Excel (F08)
// ============================================
const XLSX = require('xlsx');
const { prisma } = require('../../config/database');

class ExportService {
  /**
   * Exporte les ménages en Excel ou CSV
   * @param {'xlsx'|'csv'} format
   * @param {object} filters - { zoneId, campagneId }
   */
  async exportMenages(format = 'xlsx', filters = {}) {
    const menages = await prisma.menage.findMany({
      where: {
        deletedAt: null,
        ...(filters.zoneId && { zoneId: filters.zoneId }),
      },
      include: {
        zone: { select: { nom: true } },
        agent: { include: { user: { select: { nom: true, prenom: true } } } },
        _count: { select: { individus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = menages.map((m) => ({
      'Code Ménage': m.codeUnique,
      'Chef de Ménage': `${m.prenomChef} ${m.nomChef}`,
      'Adresse': m.adresse || '',
      'Zone': m.zone?.nom || '',
      'Agent': m.agent ? `${m.agent.user.prenom} ${m.agent.user.nom}` : '',
      'Nb Membres': m._count.individus,
      'Latitude': m.latitude || '',
      'Longitude': m.longitude || '',
      'Statut': m.statut,
      'Date Enregistrement': new Date(m.createdAt).toLocaleDateString('fr-FR'),
    }));

    return this._generateFile(rows, 'Ménages_CESUS', format);
  }

  /**
   * Exporte les individus en Excel ou CSV
   */
  async exportIndividus(format = 'xlsx', filters = {}) {
    const individus = await prisma.individu.findMany({
      where: {
        deletedAt: null,
        ...(filters.menageId && { menageId: filters.menageId }),
      },
      include: {
        menage: {
          select: {
            codeUnique: true,
            nomChef: true,
            zone: { select: { nom: true } },
          },
        },
      },
      orderBy: [{ menage: { codeUnique: 'asc' } }, { nom: 'asc' }],
    });

    const rows = individus.map((i) => ({
      'Ménage': i.menage?.codeUnique || '',
      'Zone': i.menage?.zone?.nom || '',
      'Nom': i.nom,
      'Prénom': i.prenom,
      'Sexe': i.sexe,
      'Âge': i.age || '',
      'Date Naissance': i.dateNaissance
        ? new Date(i.dateNaissance).toLocaleDateString('fr-FR')
        : '',
      'Profession': i.profession || '',
      'Niveau Étude': i.niveauEtude || '',
      'Lien Chef': i.lienChef || '',
      'Date Ajout': new Date(i.createdAt).toLocaleDateString('fr-FR'),
    }));

    return this._generateFile(rows, 'Individus_CESUS', format);
  }

  /**
   * Rapport complet multi-feuilles Excel
   */
  async exportRapportComplet() {
    const [menages, individus, zones] = await Promise.all([
      this.exportMenages('data'),
      this.exportIndividus('data'),
      prisma.zone.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { menages: true } } },
      }),
    ]);

    const wb = XLSX.utils.book_new();

    // Feuille 1 : Résumé
    const resumeData = [
      ['Rapport CESUS', new Date().toLocaleDateString('fr-FR')],
      [''],
      ['Total Ménages', menages.length],
      ['Total Individus', individus.length],
      ['Total Zones', zones.length],
    ];
    const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé');

    // Feuille 2 : Ménages
    const wsMenages = XLSX.utils.json_to_sheet(menages);
    XLSX.utils.book_append_sheet(wb, wsMenages, 'Ménages');

    // Feuille 3 : Individus
    const wsIndividus = XLSX.utils.json_to_sheet(individus);
    XLSX.utils.book_append_sheet(wb, wsIndividus, 'Individus');

    // Feuille 4 : Zones
    const wsZones = XLSX.utils.json_to_sheet(
      zones.map((z) => ({ Zone: z.nom, Région: z.region || '', Ménages: z._count.menages }))
    );
    XLSX.utils.book_append_sheet(wb, wsZones, 'Zones');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  _generateFile(rows, sheetName, format) {
    if (format === 'data') return rows;

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    if (format === 'csv') {
      return XLSX.utils.sheet_to_csv(ws);
    }
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = new ExportService();