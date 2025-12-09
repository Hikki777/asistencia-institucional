/**
 * Tests de API de Alumnos
 * Verifican CRUD completo con validaciones
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');

let app;
let token;

beforeAll(async () => {
  app = require('../server');
  
  // Limpiar datos
  await prisma.alumno.deleteMany({});
  await prisma.usuario.deleteMany({});
  
  // Crear usuario admin para obtener token
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      email: 'admin@test.com',
      hash_pass: hash,
      rol: 'admin',
      activo: true
    }
  });

  // Obtener token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@test.com',
      password: 'admin123'
    });
  
  token = loginRes.body.accessToken;
});

afterAll(async () => {
  await prisma.alumno.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.$disconnect();
});

describe('POST /api/alumnos', () => {
  test('debe retornar 401 sin autenticación', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .send({
        carnet: 'A001',
        nombres: 'Juan',
        apellidos: 'Pérez',
        grado: '1ro'
      });
    
    expect(res.status).toBe(401);
  });

  test('debe retornar 400 con datos inválidos', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carnet: 'A', // Muy corto
        nombres: '', // Vacío
        apellidos: 'Pérez'
      });
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Errores de validación');
  });

  test('debe crear alumno con datos válidos', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carnet: 'A001',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez López',
        sexo: 'M',
        grado: '1ro',
        jornada: 'Matutina'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('carnet', 'A001');
    expect(res.body).toHaveProperty('nombres', 'Juan Carlos');
    expect(res.body).toHaveProperty('estado', 'activo');
  });

  test('debe rechazar carnet duplicado', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carnet: 'A001', // Ya existe
        nombres: 'Otro',
        apellidos: 'Alumno',
        grado: '2do'
      });
    
    expect(res.status).toBe(500); // Prisma unique constraint
  });

  test('debe rechazar carnet con caracteres especiales', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carnet: 'A-001@!', // Caracteres inválidos
        nombres: 'Test',
        apellidos: 'User',
        grado: '1ro'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.detalles[0].msg).toContain('letras y números');
  });

  test('debe rechazar sexo inválido', async () => {
    const res = await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carnet: 'A002',
        nombres: 'Test',
        apellidos: 'User',
        sexo: 'X', // Solo M o F permitido
        grado: '1ro'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.detalles[0].msg).toContain('M o F');
  });
});

describe('GET /api/alumnos', () => {
  test('debe retornar lista de alumnos', async () => {
    const res = await request(app)
      .get('/api/alumnos')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('alumnos');
    expect(Array.isArray(res.body.alumnos)).toBe(true);
    expect(res.body.alumnos.length).toBeGreaterThan(0);
  });

  test('debe soportar paginación', async () => {
    const res = await request(app)
      .get('/api/alumnos?limit=1&skip=0')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.alumnos.length).toBeLessThanOrEqual(1);
  });
});

describe('GET /api/alumnos/:id', () => {
  let alumnoId;

  beforeAll(async () => {
    const alumno = await prisma.alumno.findFirst();
    alumnoId = alumno.id;
  });

  test('debe retornar 400 con ID inválido', async () => {
    const res = await request(app)
      .get('/api/alumnos/abc') // No es número
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(400);
  });

  test('debe retornar alumno por ID válido', async () => {
    const res = await request(app)
      .get(`/api/alumnos/${alumnoId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', alumnoId);
    expect(res.body).toHaveProperty('carnet');
  });

  test('debe retornar 404 con ID inexistente', async () => {
    const res = await request(app)
      .get('/api/alumnos/99999')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/alumnos/:id', () => {
  let alumnoId;

  beforeAll(async () => {
    const alumno = await prisma.alumno.findFirst();
    alumnoId = alumno.id;
  });

  test('debe actualizar alumno con datos válidos', async () => {
    const res = await request(app)
      .put(`/api/alumnos/${alumnoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombres: 'Juan Actualizado',
        grado: '2do'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nombres', 'Juan Actualizado');
    expect(res.body).toHaveProperty('grado', '2do');
  });

  test('debe rechazar datos inválidos en actualización', async () => {
    const res = await request(app)
      .put(`/api/alumnos/${alumnoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        sexo: 'INVALIDO'
      });
    
    expect(res.status).toBe(400);
  });
});
