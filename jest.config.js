// ============================================
// CESUS - jest.config.js
// Configuration des tests unitaires et d'integration backend.
// ============================================
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/tests/**/*.js'],
  coverageReporters: ['text', 'lcov'],
  testTimeout: 15000,
};
