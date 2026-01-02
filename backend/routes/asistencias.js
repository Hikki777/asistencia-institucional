const express = require('express');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');
const { qrScanLimiter } = require('../middlewares/rateLimiter');
const { logger } = require('../utils/logger');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../middlewares/cache');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyJWT);

/**
 * POST /api/asistencias
 * Registrar una asistencia (entrada o salida)
 */
router.post('/', invalidateCacheMiddleware('/api/asistencias'), async (req, res) => {
  try {
    const { alumno_id, personal_id, tipo_evento, origen, dispositivo, observaciones, timestamp } = req.body;

    logger.info({ alumno_id, personal_id, tipo_evento, origen }, '[REQUEST] Backend recibió registro de asistencia');

    // Validar que al menos uno de los IDs esté presente y tenga valor
    const hasAlumnoId = alumno_id !== undefined && alumno_id !== null && alumno_id !== '';
    const hasPersonalId = personal_id !== undefined && personal_id !== null && personal_id !== '';

    if (!hasAlumnoId && !hasPersonalId) {
      logger.error({ alumno_id, personal_id }, '[ERROR] ERROR: No hay alumno_id ni personal_id válidos');
      return res.status(400).json({
        error: 'NUEVO ERROR: Debe proporcionar alumno_id o personal_id'
      });
    }

    if (!tipo_evento) {
      logger.error({ tipo_evento }, '[ERROR] ERROR: No hay tipo_evento');
      return res.status(400).json({
        error: 'NUEVO ERROR: Falta tipo_evento'
      });
    }

    if (!['entrada', 'salida'].includes(tipo_evento)) {
      return res.status(400).json({
        error: 'tipo_evento debe ser "entrada" o "salida"'
      });
    }

    // Verificar que la persona existe
    let persona = null;
    let persona_tipo = null;
    
    if (hasAlumnoId) {
      persona = await prisma.alumno.findUnique({
        where: { id: parseInt(alumno_id) }
      });
      persona_tipo = 'alumno';
      if (!persona) {
        return res.status(404).json({ error: 'Alumno no encontrado' });
      }
    } else if (hasPersonalId) {
      persona = await prisma.personal.findUnique({
        where: { id: parseInt(personal_id) }
      });
      persona_tipo = 'personal';
      if (!persona) {
        return res.status(404).json({ error: 'Personal no encontrado' });
      }
    }

    // Usar timestamp proporcionado o fecha actual
    const fechaAsistencia = timestamp ? new Date(timestamp) : new Date();

    // Calcular estado de puntualidad (solo para entradas)
    let estado_puntualidad = null;
    if (tipo_evento === 'entrada') {
      const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
      if (institucion?.horario_inicio) {
        const [horaInicio, minInicio] = institucion.horario_inicio.split(':').map(Number);
        const horarioInicio = new Date(fechaAsistencia);
        horarioInicio.setHours(horaInicio, minInicio, 0, 0);
        
        const margen = institucion.margen_puntualidad_min || 5;
        const horarioConMargen = new Date(horarioInicio.getTime() + margen * 60000);

        if (fechaAsistencia <= horarioConMargen) {
          estado_puntualidad = 'puntual';
        } else {
          estado_puntualidad = 'tarde';
        }
      }
    }

    const asistencia = await prisma.asistencia.create({
      data: {
        persona_tipo,
        alumno_id: hasAlumnoId ? parseInt(alumno_id) : null,
        personal_id: hasPersonalId ? parseInt(personal_id) : null,
        tipo_evento,
        timestamp: fechaAsistencia,
        origen: origen || 'Manual',
        dispositivo: dispositivo || null,
        estado_puntualidad,
        observaciones: observaciones || null
      },
      include: {
        alumno: hasAlumnoId ? {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            grado: true,
            jornada: true
          }
        } : false,
        personal: hasPersonalId ? {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            cargo: true,
            jornada: true
          }
        } : false
      }
    });

    logger.info({ tipo_evento, carnet: persona.carnet, persona_tipo }, `[OK] Asistencia registrada: ${tipo_evento}`);
    res.status(201).json(asistencia);
  } catch (error) {
    logger.error({ err: error, body: req.body }, '[ERROR] Error registrando asistencia');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/asistencias
 * Listar asistencias con filtros y paginación cursor (cacheado 2 min)
 */
router.get('/', cacheMiddleware('list'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    const fecha = req.query.fecha; // YYYY-MM-DD
    const fechaDesde = req.query.desde;
    const fechaHasta = req.query.hasta;
    const alumno_id = req.query.alumno_id;
    const personal_id = req.query.personal_id;
    const tipo_evento = req.query.tipo_evento; // "entrada" o "salida"

    const where = {};

    // Filtro por fecha (día completo o rango personalizado)
    if (fechaDesde && fechaHasta) {
      where.timestamp = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta)
      };
    } else if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      where.timestamp = {
        gte: fechaInicio,
        lte: fechaFin
      };
    }

    if (alumno_id) {
      where.alumno_id = parseInt(alumno_id);
    }
    
    if (personal_id) {
      where.personal_id = parseInt(personal_id);
    }

    if (tipo_evento) {
      where.tipo_evento = tipo_evento;
    }

    const asistencias = await prisma.asistencia.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { timestamp: 'desc' },
      include: {
        alumno: {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            grado: true,
            jornada: true
          }
        },
        personal: {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            cargo: true,
            jornada: true
          }
        }
      }
    });

    const hasMore = asistencias.length > limit;
    const items = hasMore ? asistencias.slice(0, limit) : asistencias;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await prisma.asistencia.count({ where });

    res.json({
      total,
      count: items.length,
      asistencias: items,
      pagination: {
        nextCursor,
        hasMore,
        limit
      }
    });
  } catch (error) {
    logger.error({ err: error, query: req.query }, '[ERROR] Error listando asistencias');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/asistencias/hoy
 * Listar asistencias del día actual
 */
router.get('/hoy', async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        timestamp: {
          gte: hoy,
          lt: manana
        }
      },
      orderBy: { timestamp: 'desc' },
      include: {
        alumno: {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            grado: true,
            jornada: true
          }
        },
        personal: {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            cargo: true,
            jornada: true
          }
        }
      }
    });

    // Estadísticas del día
    const stats = {
      total: asistencias.length,
      entradas: asistencias.filter(a => a.tipo_evento === 'entrada').length,
      salidas: asistencias.filter(a => a.tipo_evento === 'salida').length,
      puntuales: asistencias.filter(a => a.estado_puntualidad === 'puntual').length,
      tardes: asistencias.filter(a => a.estado_puntualidad === 'tarde').length
    };

    res.json({
      fecha: hoy.toISOString().split('T')[0],
      stats,
      asistencias
    });
  } catch (error) {
    logger.error({
      err: error,
      route: '/api/asistencias/hoy',
      details: {
        message: error?.message,
        stack: error?.stack?.split('\n').slice(0, 3).join(' | ')
      },
      user: req.user || null
    }, '[ERROR] Error obteniendo asistencias de hoy');
    res.status(500).json({ error: error?.message || 'Error interno al obtener asistencias de hoy' });
  }
});

/**
 * GET /api/asistencias/stats
 * Obtener estadísticas de asistencias
 */
router.get('/stats', cacheMiddleware('stats'), async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 7;
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    fechaInicio.setHours(0, 0, 0, 0);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        persona_tipo: 'alumno',
        timestamp: {
          gte: fechaInicio
        }
      },
      select: {
        timestamp: true,
        tipo_evento: true,
        estado_puntualidad: true
      }
    });

    // Agrupar por día
    const porDia = {};
    asistencias.forEach(a => {
      const fecha = a.timestamp.toISOString().split('T')[0];
      if (!porDia[fecha]) {
        porDia[fecha] = { total: 0, entradas: 0, salidas: 0, puntuales: 0, tardes: 0 };
      }
      porDia[fecha].total++;
      if (a.tipo_evento === 'entrada') porDia[fecha].entradas++;
      if (a.tipo_evento === 'salida') porDia[fecha].salidas++;
      if (a.estado_puntualidad === 'puntual') porDia[fecha].puntuales++;
      if (a.estado_puntualidad === 'tarde') porDia[fecha].tardes++;
    });

    res.json({
      periodo: `Últimos ${dias} días`,
      porDia
    });
  } catch (error) {
    logger.error({ err: error, dias: req.query.dias }, '[ERROR] Error obteniendo estadísticas');
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/asistencias/:id
 * Eliminar una asistencia (solo admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.asistencia.delete({
      where: { id }
    });

    logger.info({ asistenciaId: id }, '[OK] Asistencia eliminada');
    res.json({ success: true, message: 'Asistencia eliminada' });
  } catch (error) {
    logger.error({ err: error, asistenciaId: req.params.id }, '[ERROR] Error eliminando asistencia');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

