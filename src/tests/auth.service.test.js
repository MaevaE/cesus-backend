const { createPrismaMock, agentUser, password } = require('./test-utils');

const mockPrisma = createPrismaMock();

jest.mock('../config/database', () => ({ prisma: mockPrisma, connectDB: jest.fn() }));
jest.mock('../config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const authService = require('../modules/auth/auth.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login retourne un utilisateur sans mot de passe et deux tokens', async () => {
    const result = await authService.login(agentUser.email, password);

    expect(result.user.email).toBe(agentUser.email);
    expect(result.user.motDePasse).toBeUndefined();
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(mockPrisma.refreshToken.create).toHaveBeenCalledTimes(1);
  });

  test('login rejette un email inexistant', async () => {
    await expect(authService.login('missing@cesus.cm', password)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  test('login rejette un mauvais mot de passe', async () => {
    await expect(authService.login(agentUser.email, 'wrong-password')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  test('registerAgent cree un agent mobile avec role AGENT', async () => {
    const user = await authService.registerAgent({
      name: 'Awa Test',
      email: 'new.agent@cesus.cm',
      telephone: '+237699000000',
      motDePasse: 'Secret123',
    });

    expect(user.email).toBe('new.agent@cesus.cm');
    expect(user.role.nom).toBe('AGENT');
    expect(user.motDePasse).toBeUndefined();
  });

  test('logout revoque tous les tokens si aucun refresh token nest fourni', async () => {
    await authService.logout(undefined, agentUser.id);
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: agentUser.id, revoked: false },
      data: { revoked: true },
    });
  });
});
