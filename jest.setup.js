/**
 * Configuración global de Jest
 * Se ejecuta antes de cada test suite
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./backend/prisma/test.db';
process.env.JWT_SECRET = 'test-jwt-secret-super-seguro-para-testing';
process.env.HMAC_SECRET = 'test-hmac-secret-super-seguro-para-testing';
process.env.PORT = '5001'; // Puerto diferente para tests

// Timeout global para tests async
jest.setTimeout(10000);

// Silenciar console.log en tests (opcional, comentar si necesitas debug)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Cleanup después de todos los tests
afterAll(async () => {
  // Dar tiempo para que las conexiones se cierren
  await new Promise(resolve => setTimeout(resolve, 500));
});
