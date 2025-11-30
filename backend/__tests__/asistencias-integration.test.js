const request = require('supertest');
const prisma = require('../prismaClient');
const { signJWT } = require('../middlewares/auth');

// Importar app sin iniciar el servidor
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Crear app simplificada para tests
const app = express();
app.use(express.json());
app.use(cors());

// Montar solo las rutas necesarias para estos tests
const authRoutes = require('../routes/auth');
const asistenciasRoutes = require('../routes/asistencias');

app.use('/api/auth', authRoutes);
app.use('/api/asistencias', asistenciasRoutes);

describe('Asistencias API Integration Tests', () => {
  let adminToken;
  let testAlumno;
  let testPersonal;

  beforeAll(async () => {
    // Crear usuario admin para tests
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('testpass123', 10);
    
    const admin = await prisma.usuario.upsert({
      where: { email: 'test-admin@test.edu' },
      update: { hash_pass: hash, activo: true },
      create: {
        email: 'test-admin@test.edu',
        hash_pass: hash,
        rol: 'admin',
        activo: true
      }
    });

    adminToken = signJWT(admin);

    // Crear alumno de prueba
    testAlumno = await prisma.alumno.upsert({
      where: { carnet: 'TEST-A001' },
      update: { nombres: 'Juan', apellidos: 'Test', estado: 'activo' },
      create: {
        carnet: 'TEST-A001',
        nombres: 'Juan',
        apellidos: 'Test',
        grado: '6to',
        estado: 'activo'
      }
    });

    // Crear personal de prueba
    testPersonal = await prisma.personal.upsert({
      where: { carnet: 'TEST-P001' },
      update: { nombres: 'Maria', apellidos: 'Test', estado: 'activo' },
      create: {
        carnet: 'TEST-P001',
        nombres: 'Maria',
        apellidos: 'Test',
        cargo: 'Docente',
        estado: 'activo'
      }
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.asistencia.deleteMany({
      where: {
        OR: [
          { alumno_id: testAlumno?.id },
          { personal_id: testPersonal?.id }
        ]
      }
    });
    await prisma.alumno.deleteMany({ where: { carnet: 'TEST-A001' } });
    await prisma.personal.deleteMany({ where: { carnet: 'TEST-P001' } });
    await prisma.usuario.deleteMany({ where: { email: 'test-admin@test.edu' } });
    
    // Cerrar conexión de Prisma para evitar handles abiertos
    await prisma.$disconnect();
  });

  describe('POST /api/asistencias', () => {
    it('debe registrar entrada de alumno con token válido', async () => {
      const response = await request(app)
        .post('/api/asistencias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          alumno_id: testAlumno.id,
          tipo_evento: 'entrada',
          origen: 'Manual'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.tipo_evento).toBe('entrada');
      expect(response.body.alumno_id).toBe(testAlumno.id);
    });

    it('debe registrar entrada de personal con token válido', async () => {
      const response = await request(app)
        .post('/api/asistencias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          personal_id: testPersonal.id,
          tipo_evento: 'entrada',
          origen: 'QR'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.tipo_evento).toBe('entrada');
      expect(response.body.personal_id).toBe(testPersonal.id);
    });

    it('debe rechazar sin token de autenticación', async () => {
      const response = await request(app)
        .post('/api/asistencias')
        .send({
          alumno_id: testAlumno.id,
          tipo_evento: 'entrada'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debe rechazar sin alumno_id ni personal_id', async () => {
      const response = await request(app)
        .post('/api/asistencias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tipo_evento: 'entrada'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('alumno_id o personal_id');
    });

    it('debe rechazar tipo_evento inválido', async () => {
      const response = await request(app)
        .post('/api/asistencias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          alumno_id: testAlumno.id,
          tipo_evento: 'invalido'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/asistencias/hoy', () => {
    it('debe listar asistencias del día actual', async () => {
      const response = await request(app)
        .get('/api/asistencias/hoy')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fecha');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('asistencias');
      expect(Array.isArray(response.body.asistencias)).toBe(true);
    });

    it('debe incluir stats con conteos correctos', async () => {
      const response = await request(app)
        .get('/api/asistencias/hoy')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('entradas');
      expect(response.body.stats).toHaveProperty('salidas');
      expect(typeof response.body.stats.total).toBe('number');
    });

    it('debe rechazar sin token', async () => {
      const response = await request(app)
        .get('/api/asistencias/hoy');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/asistencias/stats', () => {
    it('debe retornar estadísticas con días por defecto', async () => {
      const response = await request(app)
        .get('/api/asistencias/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('periodo');
      expect(response.body).toHaveProperty('porDia');
      expect(typeof response.body.porDia).toBe('object');
    });

    it('debe aceptar parámetro días personalizado', async () => {
      const response = await request(app)
        .get('/api/asistencias/stats?dias=3')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.periodo).toContain('3 días');
    });
  });

  describe('GET /api/asistencias', () => {
    it('debe listar asistencias con paginación', async () => {
      const response = await request(app)
        .get('/api/asistencias?limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('asistencias');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.asistencias)).toBe(true);
      expect(response.body.asistencias.length).toBeLessThanOrEqual(10);
    });

    it('debe filtrar por alumno_id', async () => {
      const response = await request(app)
        .get(`/api/asistencias?alumno_id=${testAlumno.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.asistencias.forEach(a => {
        if (a.alumno_id) {
          expect(a.alumno_id).toBe(testAlumno.id);
        }
      });
    });

    it('debe filtrar por tipo_evento', async () => {
      const response = await request(app)
        .get('/api/asistencias?tipo_evento=entrada')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.asistencias.forEach(a => {
        expect(a.tipo_evento).toBe('entrada');
      });
    });
  });
});
