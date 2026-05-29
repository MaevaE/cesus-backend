const request = require('supertest');
const {
  createPrismaMock,
  agentUser,
  adminUser,
  password,
  zone,
  menage,
} = require('./test-utils');

const mockPrisma = createPrismaMock();

jest.mock('../config/database', () => ({ prisma: mockPrisma, connectDB: jest.fn() }));
jest.mock('../config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const app = require('../app');

async function loginAsAgent() {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: agentUser.email, motDePasse: password });
  return response.body.data.accessToken;
}

describe('API CESUS - integration avec dependances mockees', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health retourne le statut de lAPI', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('POST /api/v1/auth/login accepte le format mobile et retourne les tokens', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: agentUser.email, password });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        user: { email: agentUser.email },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      },
    });
  });

  test('POST /api/v1/auth/login retourne 422 si le body est incomplet', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: agentUser.email });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/v1/auth/me refuse une requete sans token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('NO_TOKEN');
  });

  test('GET /api/v1/zones retourne une liste paginee pour un agent connecte', async () => {
    const token = await loginAsAgent();
    const response = await request(app)
      .get('/api/v1/zones')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({ id: zone.id, nom: zone.nom });
    expect(response.body.meta).toMatchObject({ total: 1, page: 1 });
  });

  test('POST /api/v1/menages accepte exactement le formulaire mobile', async () => {
    const token = await loginAsAgent();
    const response = await request(app)
      .post('/api/v1/menages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        region: 'Centre',
        ville: 'Yaounde',
        quartier: 'Bastos',
        zone: zone.nom,
        chefMenage: 'Paul Mvondo',
        telephone: '699000000',
        nbPersonnes: 3,
        nbHommes: 1,
        nbFemmes: 1,
        nbEnfants: 1,
        typeHabitation: 'Maison individuelle',
        nbPieces: 3,
        sourceEau: 'Forage',
        accesElectricite: 'Oui',
        typeToilettes: 'Interieures',
        profession: 'Agriculteur',
        revenu: '100000',
        observations: 'RAS',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: menage.id,
      nomChef: 'Mvondo',
      prenomChef: 'Paul',
      zoneId: zone.id,
      statut: 'SYNCHRONISE',
    });
  });

  test('POST /api/v1/individus cree un individu par endpoint direct', async () => {
    const token = await loginAsAgent();
    const response = await request(app)
      .post('/api/v1/individus')
      .set('Authorization', `Bearer ${token}`)
      .send({
        menageId: menage.id,
        nom: 'Mvondo',
        prenom: 'Aline',
        sexe: 'FEMININ',
        age: 25,
        profession: 'Commercante',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ menageId: menage.id, sexe: 'FEMININ' });
  });

  test('POST /api/v1/sync synchronise un lot vide mais valide depuis le mobile', async () => {
    const token = await loginAsAgent();
    const response = await request(app)
      .post('/api/v1/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ menages: [], individus: [] });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ created: 0, updated: 0, errors: [] });
  });

  test('GET /api/v1/agents/me/dashboard retourne les KPIs mobiles', async () => {
    const token = await loginAsAgent();
    const response = await request(app)
      .get('/api/v1/agents/me/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      population: 1,
      menages: 1,
      zones: 1,
    });
  });

  test('GET /api/v1/stats/dashboard interdit laccess agent', async () => {
    const token = await loginAsAgent();
    const response = await request(app)
      .get('/api/v1/stats/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });
});
