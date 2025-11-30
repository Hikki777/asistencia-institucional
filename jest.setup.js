/**
 * Setup global de Jest
 * Se ejecuta antes de cada test suite
 */

// Suprimir logs de dotenv en tests
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

// Aumentar timeout por defecto para tests de integración
jest.setTimeout(30000);

// Mock de console para tests más limpios (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
