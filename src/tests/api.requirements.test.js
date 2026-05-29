const request = require('supertest');
const {
  createPrismaMock,
  agentRole,
  agentUser,
  adminUser,
  password,
  zone,
  menage,
  individu,
  campagne,
} = require('./test-utils');

const mockPrisma = createPrismaMock();

jest.mock('../config/database', () => ({ prisma: mockPrisma, connectDB: jest.fn() }));
jest.mock('../config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const app = require('../app');

async function login(email = agentUser.email) {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, motDePasse: password });
  return response.body.data.accessToken;
}

describe('API CESUS - exigences fonctionnelles principales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste l'inscription admin d'un nouvel utilisateur agent.
  test('POST /api/v1/auth/register inscrit un utilisateur quand ladmin est authentifie', async () => {
    const token = await login(adminUser.email);
    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nom: 'Nouveau',
        prenom: 'Agent',
        email: 'agent.nouveau@cesus.cm',
        motDePasse: 'Secret123',
        telephone: '+237699000002',
        roleId: agentRole.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.motDePasse).toBeUndefined();
  });

  // Teste le rejet d'une inscription avec un email deja utilise.
  test('POST /api/v1/auth/register refuse un email deja existant', async () => {
    const token = await login(adminUser.email);
    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nom: 'Mbarga',
        prenom: 'Jean',
        email: agentUser.email,
        motDePasse: 'Secret123',
        roleId: agentRole.id,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  // Teste le rejet d'une connexion avec un mauvais mot de passe.
  test('POST /api/v1/auth/login refuse un mauvais mot de passe', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: agentUser.email, motDePasse: 'mauvais-secret' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // Teste le rejet d'un token JWT invalide sur une route protegee.
  test('GET /api/v1/auth/me refuse un token invalide', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer token-invalide');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('TOKEN_INVALID');
  });

  // Teste la liste, la modification PUT et la suppression logique d'un menage.
  test('CRUD menages couvre liste, modification PUT et suppression agent', async () => {
    const token = await login();

    const listResponse = await request(app)
      .get('/api/v1/menages')
      .set('Authorization', `Bearer ${token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].id).toBe(menage.id);

    const updateResponse = await request(app)
      .put(`/api/v1/menages/${menage.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ adresse: 'Nouvelle adresse' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.adresse).toBe('Nouvelle adresse');

    const deleteResponse = await request(app)
      .delete(`/api/v1/menages/${menage.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);
  });

  // Teste la liste par menage, la modification PUT et la suppression d'un individu.
  test('CRUD individus couvre liste par menage, modification PUT et suppression', async () => {
    const token = await login();

    const listResponse = await request(app)
      .get(`/api/v1/individus?menageId=${menage.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].id).toBe(individu.id);

    const updateResponse = await request(app)
      .put(`/api/v1/individus/${individu.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ profession: 'Enseignante' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.profession).toBe('Enseignante');

    const deleteResponse = await request(app)
      .delete(`/api/v1/individus/${individu.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);
  });

  // Teste le CRUD zones reserve a l'administrateur.
  test('CRUD zones couvre creation, modification PUT et suppression', async () => {
    const token = await login(adminUser.email);

    const createResponse = await request(app)
      .post('/api/v1/zones')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Zone Nouvelle', region: 'Centre' });
    expect(createResponse.status).toBe(201);

    const updateResponse = await request(app)
      .put(`/api/v1/zones/${zone.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Zone modifiee' });
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await request(app)
      .delete(`/api/v1/zones/${zone.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);
  });

  // Teste les statistiques globales attendues par le dashboard.
  test('GET /api/v1/stats retourne les statistiques globales', async () => {
    const token = await login(adminUser.email);
    const response = await request(app)
      .get('/api/v1/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.totaux).toMatchObject({ population: 1, menages: 1, agents: 1, zones: 1 });
  });

  // Teste la liste des agents avec leur progression de collecte.
  test('GET /api/v1/agents retourne les agents avec progression', async () => {
    const token = await login(adminUser.email);
    const response = await request(app)
      .get('/api/v1/agents')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0].progression).toMatchObject({ menagesRecenses: 2 });
  });

  // Teste la gestion minimale des campagnes.
  test('GET et POST /api/v1/campagnes gerent les campagnes', async () => {
    const token = await login(adminUser.email);

    const listResponse = await request(app)
      .get('/api/v1/campagnes')
      .set('Authorization', `Bearer ${token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].id).toBe(campagne.id);

    const createResponse = await request(app)
      .post('/api/v1/campagnes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Campagne 2026', dateDebut: '2026-01-01', zoneIds: [zone.id] });
    expect(createResponse.status).toBe(201);
  });

  // Teste l'export JSON generique demande par le cahier des charges.
  test('GET /api/v1/export retourne un export JSON', async () => {
    const token = await login(adminUser.email);
    const response = await request(app)
      .get('/api/v1/export?type=menages&format=json')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Object.keys(response.body.data[0]).some((key) => key.startsWith('Code'))).toBe(true);
  });
});
