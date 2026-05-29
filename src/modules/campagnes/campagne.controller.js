// ============================================
// CESUS - controllers/campagne.controller.js
// Traduit les requetes HTTP de campagnes vers le service metier.
// ============================================
const campagneService = require('./campagne.service');
const ApiResponse = require('../../utils/ApiResponse');
const { logAction } = require('../../utils/auditLog');

class CampagneController {
  /**
   * @description Liste les campagnes de recensement.
   * @param {Object} req - Requete Express.
   * @param {Object} res - Reponse Express.
   * @param {Function} next - Middleware suivant.
   * @returns {Object} JSON pagine.
   */
  async getAll(req, res, next) {
    try {
      const { data, total, page, limit } = await campagneService.getAll(req.query);
      return ApiResponse.paginated(res, data, total, page, limit, 'Campagnes recuperees');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Recupere le detail d'une campagne.
   * @param {Object} req - Requete Express.
   * @param {Object} res - Reponse Express.
   * @param {Function} next - Middleware suivant.
   * @returns {Object} JSON avec la campagne.
   */
  async getById(req, res, next) {
    try {
      const campagne = await campagneService.getById(req.params.id);
      return ApiResponse.success(res, campagne, 'Campagne recuperee');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Cree une campagne.
   * @param {Object} req - Requete Express contenant les donnees de campagne.
   * @param {Object} res - Reponse Express.
   * @param {Function} next - Middleware suivant.
   * @returns {Object} JSON avec la campagne creee.
   */
  async create(req, res, next) {
    try {
      const campagne = await campagneService.create(req.body);
      await logAction({
        action: 'CAMPAGNE_CREATE',
        entite: 'campagnes',
        entiteId: campagne.id,
        req,
        details: { nom: campagne.nom },
      });
      return ApiResponse.created(res, campagne, 'Campagne creee');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Met a jour une campagne.
   * @param {Object} req - Requete Express.
   * @param {Object} res - Reponse Express.
   * @param {Function} next - Middleware suivant.
   * @returns {Object} JSON avec la campagne modifiee.
   */
  async update(req, res, next) {
    try {
      const campagne = await campagneService.update(req.params.id, req.body);
      await logAction({
        action: 'CAMPAGNE_UPDATE',
        entite: 'campagnes',
        entiteId: campagne.id,
        req,
        details: { champs: Object.keys(req.body) },
      });
      return ApiResponse.success(res, campagne, 'Campagne mise a jour');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @description Supprime logiquement une campagne.
   * @param {Object} req - Requete Express.
   * @param {Object} res - Reponse Express.
   * @param {Function} next - Middleware suivant.
   * @returns {Object} JSON de confirmation.
   */
  async delete(req, res, next) {
    try {
      await campagneService.delete(req.params.id);
      await logAction({ action: 'CAMPAGNE_DELETE', entite: 'campagnes', entiteId: req.params.id, req });
      return ApiResponse.success(res, null, 'Campagne supprimee');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CampagneController();
