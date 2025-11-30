module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/**/*.test.js',
    '!backend/node_modules/**',
    '!backend/prisma/migrations/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  verbose: true,
  // Forzar salida después de tests
  forceExit: true,
  // Transformar node_modules que usan ESM
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  // Mapear módulos ESM a CommonJS cuando sea necesario
  moduleNameMapper: {
    '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js'
  }
};
