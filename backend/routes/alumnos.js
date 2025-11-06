const express = require('express');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');
const { 
  validarCrearAlumno, 
  validarActualizarAlumno, 
  validarId 
} = require('../middlewares/validation');
const { logger } = require('../utils/logger');

const router = express.Router();

// Aplicar autenticación a todas las rutas de alumnos
router.use(verifyJWT);

/**
 * GET /api/alumnos
 * Listar todos los alumnos
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const estado = req.query.estado || 'activo';

    const alumnos = await prisma.alumno.findMany({
      where: { estado },
      skip,
      take: limit,
      select: {
        id: true,
        carnet: true,
        nombres: true,
        apellidos: true,
        sexo: true,
        grado: true,
        jornada: true,
        estado: true,
        creado_en: true
      }
    });

    const total = await prisma.alumno.count({ where: { estado } });

    res.json({
      total,
      count: alumnos.length,
      alumnos
    });
  } catch (error) {
    logger.error({ err: error, query: req.query }, '❌ Error al listar alumnos');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/alumnos/:id
 * Obtener alumno por ID
 */
router.get('/:id', validarId, async (req, res) => {
  try {
    const alumno = await prisma.alumno.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        codigos_qr: true,
        asistencias: { take: 10, orderBy: { timestamp: 'desc' } }
      }
    });

    if (!alumno) {
      logger.warn({ alumnoId: req.params.id }, '⚠️ Alumno no encontrado');
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    res.json(alumno);
  } catch (error) {
    logger.error({ err: error, alumnoId: req.params.id }, '❌ Error al obtener alumno');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/alumnos
 * Crear nuevo alumno
 */
router.post('/', validarCrearAlumno, async (req, res) => {
  try {
    const { carnet, nombres, apellidos, sexo, grado, jornada } = req.body;

    if (!carnet || !nombres || !apellidos || !grado) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: carnet, nombres, apellidos, grado'
      });
    }

    // Verificar carnet único
    const existing = await prisma.alumno.findUnique({ where: { carnet } }).catch(() => null);
    if (existing) {
      return res.status(409).json({ error: 'Carnet ya existe' });
    }

    const alumno = await prisma.alumno.create({
      data: {
        carnet,
        nombres,
        apellidos,
        sexo: sexo || null,
        grado,
        jornada: jornada || 'Matutina',
        estado: 'activo'
      }
    });

    // Registrar en auditoria
    await prisma.auditoria.create({
      data: {
        entidad: 'Alumno',
        entidad_id: alumno.id,
        accion: 'crear',
        detalle: JSON.stringify({ carnet, nombres })
      }
    });

    logger.info({ alumnoId: alumno.id, carnet, nombres, apellidos }, '✅ Alumno creado');
    res.status(201).json(alumno);
  } catch (error) {
    logger.error({ err: error, body: req.body }, '❌ Error al crear alumno');
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/alumnos/:id
 * Actualizar alumno
 */
router.put('/:id', validarActualizarAlumno, async (req, res) => {
  try {
    const { nombres, apellidos, sexo, grado, jornada, estado } = req.body;
    const id = parseInt(req.params.id);

    const alumno = await prisma.alumno.update({
      where: { id },
      data: {
        ...(nombres && { nombres }),
        ...(apellidos && { apellidos }),
        ...(sexo && { sexo }),
        ...(grado && { grado }),
        ...(jornada && { jornada }),
        ...(estado && { estado })
      }
    });

    // Registrar en auditoria
    await prisma.auditoria.create({
      data: {
        entidad: 'Alumno',
        entidad_id: id,
        accion: 'actualizar',
        detalle: JSON.stringify({ campos: Object.keys(req.body) })
      }
    });

    logger.info({ alumnoId: id, campos: Object.keys(req.body) }, '✅ Alumno actualizado');
    res.json(alumno);
  } catch (error) {
    logger.error({ err: error, alumnoId: req.params.id }, '❌ Error al actualizar alumno');
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/alumnos/:id
 * Inactivar alumno (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const alumno = await prisma.alumno.update({
      where: { id },
      data: { estado: 'inactivo' }
    });

    // Registrar en auditoria
    await prisma.auditoria.create({
      data: {
        entidad: 'Alumno',
        entidad_id: id,
        accion: 'inactivar',
        detalle: JSON.stringify({ anterior: 'activo', nuevo: 'inactivo' })
      }
    });

    logger.info({ alumnoId: id }, '✅ Alumno inactivado');
    res.json({ success: true, message: 'Alumno inactivado' });
  } catch (error) {
    logger.error({ err: error, alumnoId: req.params.id }, '❌ Error al inactivar alumno');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
