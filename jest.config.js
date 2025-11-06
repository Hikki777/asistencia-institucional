module.exports = {
  // Entorno de testing
  testEnvironment: 'node',

  // Patrón para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend-react/',
    '/uploads/',
    '/backups/',
    '/temp-reports/'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/prisma/**',
    '!backend/**/*.test.js',
    '!backend/**/*.spec.js',
    '!**/node_modules/**'
  ],

  // Umbral de cobertura (opcional, comentado por ahora)
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50
  //   }
  // },

  // Configuración de timeouts
  testTimeout: 10000, // 10 segundos

  // Limpiar mocks entre tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Variables de entorno para tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Verbose output
  verbose: true,

  // Mostrar errores individuales
  bail: false,

  // Ejecutar tests en serie (más lento pero más confiable)
  maxWorkers: 1
};
