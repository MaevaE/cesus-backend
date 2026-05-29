// ============================================
// CESUS - controllers/agent.controller.js
// Controle les endpoints mobiles lies a l'agent connecte.
// ============================================
const agentService = require('./agent.service');
const ApiResponse = require('../../utils/ApiResponse');

class AgentController {
  /**
   * GET /api/v1/agents/me - profil agent connecte.
   */
  async me(req, res, next) {
    try {
      const agent = await agentService.getCurrentAgent(req.user);
      return ApiResponse.success(res, agent, 'Profil agent recupere');
    } catch (error) { next(error); }
  }

  /**
   * GET /api/v1/agents/me/dashboard - KPIs pour le dashboard mobile.
   */
  async dashboard(req, res, next) {
    try {
      const dashboard = await agentService.getDashboard(req.user);
      return ApiResponse.success(res, dashboard, 'Dashboard agent recupere');
    } catch (error) { next(error); }
  }

  /**
   * GET /api/v1/agents/me/mission - mission/zone assignee.
   */
  async mission(req, res, next) {
    try {
      const mission = await agentService.getMission(req.user);
      return ApiResponse.success(res, mission, 'Mission agent recuperee');
    } catch (error) { next(error); }
  }

  /**
   * PATCH /api/v1/agents/me/location - derniere position GPS de l'agent.
   */
  async updateLocation(req, res, next) {
    try {
      const agent = await agentService.updateLocation(req.user, req.body);
      return ApiResponse.success(res, agent, 'Position agent mise a jour');
    } catch (error) { next(error); }
  }
}

module.exports = new AgentController();
