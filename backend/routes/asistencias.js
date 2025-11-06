const express = require('express');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');
const { qrScanLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyJWT);

/**
 * POST /api/asistencias
 * Registrar una asistencia (entrada o salida)
 */
router.post('/', async (req, res) => {
  try {
    const { alumno_id, docente_id, tipo_evento, origen, dispositivo, observaciones, timestamp } = req.body;

    console.log('📥 Backend recibió:', { alumno_id, docente_id, tipo_evento, origen });

    // Validar que al menos uno de los IDs esté presente y tenga valor
    const hasAlumnoId = alumno_id !== undefined && alumno_id !== null && alumno_id !== '';
    const hasDocenteId = docente_id !== undefined && docente_id !== null && docente_id !== '';

    if (!hasAlumnoId && !hasDocenteId) {
      console.log('❌ ERROR: No hay alumno_id ni docente_id válidos');
      return res.status(400).json({
        error: 'NUEVO ERROR: Debe proporcionar alumno_id o docente_id'
      });
    }

    if (!tipo_evento) {
      console.log('❌ ERROR: No hay tipo_evento');
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
    } else if (hasDocenteId) {
      persona = await prisma.personal.findUnique({
        where: { id: parseInt(docente_id) }
      });
      persona_tipo = 'personal';
      if (!persona) {
        return res.status(404).json({ error: 'Docente no encontrado' });
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
        personal_id: hasDocenteId ? parseInt(docente_id) : null,
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
        personal: hasDocenteId ? {
          select: {
            id: true,
            carnet: true,
            nombres: true,
            apellidos: true,
            grado: true,
            jornada: true
          }
        } : false
      }
    });

    console.log(`✅ Asistencia registrada: ${tipo_evento} - ${persona.carnet} (${persona_tipo})`);
    res.status(201).json(asistencia);
  } catch (error) {
    console.error('[POST /api/asistencias]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/asistencias
 * Listar asistencias con filtros
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const fecha = req.query.fecha; // YYYY-MM-DD
    const alumno_id = req.query.alumno_id;
    const docente_id = req.query.docente_id;
    const tipo_evento = req.query.tipo_evento; // "entrada" o "salida"

    const where = {};

    // Filtro por fecha (día completo)
    if (fecha) {
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
    
    if (docente_id) {
      where.docente_id = parseInt(docente_id);
    }

    if (tipo_evento) {
      where.tipo_evento = tipo_evento;
    }

    const asistencias = await prisma.asistencia.findMany({
      where,
      skip,
      take: limit,
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
            grado: true,
            jornada: true
          }
        }
      }
    });

    const total = await prisma.asistencia.count({ where });

    res.json({
      total,
      count: asistencias.length,
      asistencias
    });
  } catch (error) {
    console.error('[GET /api/asistencias]', error.message);
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
            grado: true,
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
    console.error('[GET /api/asistencias/hoy]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/asistencias/stats
 * Obtener estadísticas de asistencias
 */
router.get('/stats', async (req, res) => {
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
    console.error('[GET /api/asistencias/stats]', error.message);
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

    console.log(`✅ Asistencia eliminada: ${id}`);
    res.json({ success: true, message: 'Asistencia eliminada' });
  } catch (error) {
    console.error('[DELETE /api/asistencias/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
