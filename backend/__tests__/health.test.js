/**
 * Tests de Health Check y Endpoints Públicos
 */

const request = require('supertest');

let app;

beforeAll(() => {
  app = require('../server');
});

describe('GET /api/health', () => {
  test('debe retornar status ok', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  test('debe retornar timestamp en formato ISO', async () => {
    const res = await request(app).get('/api/health');
    
    const timestamp = new Date(res.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });

  test('debe retornar uptime como número', async () => {
    const res = await request(app).get('/api/health');
    
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('Rate Limiting', () => {
  test('debe incluir headers de rate limit', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
    expect(res.headers).toHaveProperty('ratelimit-reset');
  });
});

describe('Security Headers', () => {
  test('debe incluir headers de seguridad de Helmet', async () => {
    const res = await request(app).get('/api/health');
    
    // Helmet headers
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('x-content-type-options');
    expect(res.headers).toHaveProperty('x-download-options');
  });

  test('debe tener X-Content-Type-Options en nosniff', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('CORS', () => {
  test('debe permitir requests sin origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', ''); // Sin origin
    
    expect(res.status).toBe(200);
  });

  test('debe permitir origin permitido', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
