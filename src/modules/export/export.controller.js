// ============================================
// CESUS – controllers/export.controller.js
// ============================================
const exportService = require('./export.service');

class ExportController {
  async exportMenages(req, res, next) {
    try {
      const format = req.query.format || 'xlsx';
      const data = await exportService.exportMenages(format, req.query);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="menages_cesus.csv"');
        return res.send('\uFEFF' + data); // BOM pour Excel
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="menages_cesus.xlsx"');
      return res.send(data);
    } catch (e) { next(e); }
  }

  async exportIndividus(req, res, next) {
    try {
      const format = req.query.format || 'xlsx';
      const data = await exportService.exportIndividus(format, req.query);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="individus_cesus.csv"');
        return res.send('\uFEFF' + data);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="individus_cesus.xlsx"');
      return res.send(data);
    } catch (e) { next(e); }
  }

  async exportRapport(req, res, next) {
    try {
      const buffer = await exportService.exportRapportComplet();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="rapport_cesus.xlsx"');
      return res.send(buffer);
    } catch (e) { next(e); }
  }
}

module.exports = new ExportController();