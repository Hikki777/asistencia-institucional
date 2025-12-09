/**
 * Tests de Autenticación
 * Verifican el flujo de login y protección de rutas
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');

// Importar app sin iniciar el servidor
let app;

beforeAll(async () => {
  // Importar app después de configurar env
  app = require('../server');
  
  // Limpiar base de datos de test
  await prisma.usuario.deleteMany({});
  
  // Crear usuario de prueba
  const hash = await bcrypt.hash('password123', 10);
  await prisma.usuario.create({
    data: {
      email: 'test@test.com',
      hash_pass: hash,
      rol: 'admin',
      activo: true
    }
  });
});

afterAll(async () => {
  // Limpiar y cerrar conexiones
  await prisma.usuario.deleteMany({});
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  test('debe retornar 400 si faltan credenciales', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('debe retornar 400 con email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'password123'
      });
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Errores de validación');
  });

  test('debe retornar 401 con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrong-password'
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
  });

  test('debe retornar token con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'test@test.com');
    expect(res.body.user).toHaveProperty('rol', 'admin');
  });

  test('debe activar rate limiting después de 5 intentos', async () => {
    // Hacer 5 intentos fallidos
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrong-password'
        });
    }

    // El 6to intento debe ser bloqueado
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrong-password'
      });
    
    expect(res.status).toBe(429); // Too Many Requests
    expect(res.body).toHaveProperty('error');
  }, 20000); // Timeout extendido para este test
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    // Obtener token válido
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    
    token = res.body.accessToken;
  });

  test('debe retornar 401 sin token', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    
    expect(res.status).toBe(401);
  });

  test('debe retornar 401 con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido');
    
    expect(res.status).toBe(401);
  });

  test('debe retornar perfil de usuario con token válido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@test.com');
    expect(res.body).toHaveProperty('rol', 'admin');
    expect(res.body).toHaveProperty('activo', true);
  });
});
