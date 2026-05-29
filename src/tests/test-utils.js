process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';

const bcrypt = require('bcryptjs');

const agentRole = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  nom: 'AGENT',
  description: 'Agent recenseur',
};
const adminRole = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  nom: 'ADMIN',
  description: 'Administrateur',
};
const zone = {
  id: '11111111-1111-4111-8111-111111111111',
  nom: 'Zone A - Centre',
  region: 'Centre',
  departement: 'Yaounde',
  latitude: 3.8936,
  longitude: 11.5167,
  deletedAt: null,
};
const agent = {
  id: '22222222-2222-4222-8222-222222222222',
  userId: '33333333-3333-4333-8333-333333333333',
  zoneId: zone.id,
  zone,
  latitudeDernier: null,
  longitudeDernier: null,
  derniereActivite: null,
  _count: { menagesRecenses: 2 },
};

const password = 'Secret123';
const hashedPassword = bcrypt.hashSync(password, 12);

const agentUser = {
  id: agent.userId,
  nom: 'Mbarga',
  prenom: 'Jean',
  email: 'agent1@cesus.cm',
  motDePasse: hashedPassword,
  telephone: '+237611000001',
  actif: true,
  roleId: agentRole.id,
  role: agentRole,
  agent,
  deletedAt: null,
};

const adminUser = {
  ...agentUser,
  id: '44444444-4444-4444-8444-444444444444',
  email: 'admin@cesus.cm',
  roleId: adminRole.id,
  role: adminRole,
  agent: null,
};

const menage = {
  id: '55555555-5555-4555-8555-555555555555',
  codeUnique: 'ZON-123456',
  nomChef: 'Mvondo',
  prenomChef: 'Paul',
  adresse: 'Bastos, Yaounde, Centre',
  latitude: 3.8936,
  longitude: 11.5167,
  zoneId: zone.id,
  agentId: agent.id,
  nombreMembres: 3,
  statut: 'SYNCHRONISE',
  zone,
  agent: { ...agent, user: agentUser },
  individus: [],
  _count: { individus: 1 },
  deletedAt: null,
};

const individu = {
  id: '66666666-6666-4666-8666-666666666666',
  nom: 'Mvondo',
  prenom: 'Aline',
  sexe: 'FEMININ',
  age: 25,
  profession: 'Commercante',
  niveauEtude: 'SECONDAIRE',
  menageId: menage.id,
  statut: 'SYNCHRONISE',
  deletedAt: null,
};

const campagne = {
  id: '99999999-9999-4999-8999-999999999999',
  nom: 'Recensement National 2026',
  description: 'Campagne de test',
  dateDebut: new Date('2026-01-01'),
  dateFin: null,
  statut: 'EN_COURS',
  zones: [{ id: 'camp-zone-1', zoneId: zone.id, campagneId: '99999999-9999-4999-8999-999999999999', zone }],
  deletedAt: null,
};

function createPrismaMock() {
  const prisma = {
    user: {
      findFirst: jest.fn(async ({ where }) => {
        if (where?.id === adminUser.id) return adminUser;
        if (where?.id === agentUser.id) return agentUser;
        if (where?.email === adminUser.email) return adminUser;
        if (where?.email === agentUser.email) return agentUser;
        return null;
      }),
      create: jest.fn(async ({ data }) => ({
        id: '77777777-7777-4777-8777-777777777777',
        ...data,
        role: agentRole,
        agent: data.agent ? { ...agent, id: '88888888-8888-4888-8888-888888888888' } : null,
      })),
      update: jest.fn(async ({ data }) => ({ ...agentUser, ...data })),
    },
    role: {
      findUnique: jest.fn(async ({ where }) => {
        if (where?.nom === 'AGENT' || where?.id === agentRole.id) return agentRole;
        if (where?.nom === 'ADMIN' || where?.id === adminRole.id) return adminRole;
        return null;
      }),
    },
    refreshToken: {
      create: jest.fn(async ({ data }) => ({ id: 'refresh-1', ...data, revoked: false })),
      findUnique: jest.fn(async ({ where }) => ({
        id: 'refresh-1',
        token: where.token,
        revoked: false,
        expiresAt: new Date(Date.now() + 86400000),
        user: agentUser,
      })),
      update: jest.fn(async ({ data }) => ({ id: 'refresh-1', ...data })),
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
    log: {
      create: jest.fn(async ({ data }) => ({ id: 'log-1', ...data })),
    },
    agent: {
      findUnique: jest.fn(async ({ where }) => {
        if (where?.userId === agentUser.id || where?.id === agent.id) return agent;
        return null;
      }),
      count: jest.fn(async () => 1),
      findMany: jest.fn(async () => [{ ...agent, user: agentUser, zone, _count: { menagesRecenses: 2 } }]),
      update: jest.fn(async ({ data }) => ({ ...agent, ...data, user: agentUser, zone })),
    },
    zone: {
      findFirst: jest.fn(async ({ where }) => {
        if (where?.id && where.id !== zone.id) return null;
        return zone;
      }),
      findMany: jest.fn(async () => [{ ...zone, _count: { menages: 1, agents: 1 } }]),
      findUnique: jest.fn(async () => zone),
      create: jest.fn(async ({ data }) => ({ ...zone, ...data, id: zone.id })),
      update: jest.fn(async ({ data }) => ({ ...zone, ...data })),
      count: jest.fn(async () => 1),
    },
    menage: {
      findMany: jest.fn(async () => [menage]),
      findFirst: jest.fn(async () => menage),
      create: jest.fn(async ({ data }) => ({ ...menage, ...data, id: menage.id, zone })),
      update: jest.fn(async ({ data }) => ({ ...menage, ...data })),
      count: jest.fn(async () => 1),
    },
    individu: {
      findMany: jest.fn(async () => [individu]),
      findFirst: jest.fn(async () => individu),
      create: jest.fn(async ({ data }) => ({ ...individu, ...data, id: individu.id })),
      update: jest.fn(async ({ data }) => ({ ...individu, ...data })),
      count: jest.fn(async () => 1),
      groupBy: jest.fn(async () => [{ sexe: 'FEMININ', _count: { sexe: 1 } }]),
    },
    campagne: {
      findMany: jest.fn(async () => [campagne]),
      findFirst: jest.fn(async ({ where }) => (where?.id && where.id !== campagne.id ? null : campagne)),
      create: jest.fn(async ({ data }) => ({ ...campagne, ...data, id: campagne.id })),
      update: jest.fn(async ({ data }) => ({ ...campagne, ...data })),
      count: jest.fn(async () => 1),
    },
    campagneZone: {
      deleteMany: jest.fn(async () => ({ count: 1 })),
    },
    $connect: jest.fn(async () => undefined),
    $disconnect: jest.fn(async () => undefined),
    $on: jest.fn(),
    $transaction: jest.fn(async (callback) => callback(prisma)),
  };

  return prisma;
}

module.exports = {
  agentRole,
  adminRole,
  agentUser,
  adminUser,
  password,
  zone,
  agent,
  menage,
  individu,
  campagne,
  createPrismaMock,
};
