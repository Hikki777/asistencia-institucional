const express = require('express');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Proteger todas las rutas
router.use(verifyJWT);

/**
 * POST /api/excusas
 * Registrar una excusa para alumno o personal
 * Body: { motivo, tipo, alumno_id?, personal_id? }
 */
router.post('/', async (req, res) => {
  try {
    const { motivo, tipo, alumno_id, personal_id } = req.body;
    if (!motivo || !tipo || (!alumno_id && !personal_id)) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const data = {
      motivo,
      fecha: new Date(),
      alumno_id: tipo === 'alumno' ? parseInt(alumno_id) : undefined,
      personal_id: tipo === 'personal' ? parseInt(personal_id) : undefined
    };
    const excusa = await prisma.excusa.create({ data });
    logger.info({ excusa }, 'Excusa registrada');
    res.json({ success: true, excusa });
  } catch (error) {
    logger.error({ err: error }, 'Error registrando excusa');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/excusas
 * Listar excusas por fecha, alumno o personal
 * Query: fecha=YYYY-MM-DD, alumno_id, personal_id
 */
router.get('/', async (req, res) => {
  try {
    const { fecha, alumno_id, personal_id } = req.query;
    const where = {};
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = { gte: fechaInicio, lte: fechaFin };
    }
    if (alumno_id) where.alumno_id = parseInt(alumno_id);
    if (personal_id) where.personal_id = parseInt(personal_id);
    const excusas = await prisma.excusa.findMany({ where });
    res.json({ excusas });
  } catch (error) {
    logger.error({ err: error }, 'Error listando excusas');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
