const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { logger } = require('../utils/logger');

// GET /api/institucion - Obtener datos de la institución
router.get('/', async (req, res) => {
  try {
    let institucion = await prisma.institucion.findFirst({
      where: { id: 1 }
    });

    // Si no existe, crear una por defecto
    if (!institucion) {
      institucion = await prisma.institucion.create({
        data: {
          id: 1,
          nombre: 'Mi Institución Educativa',
          horario_inicio: '07:00',
          margen_puntualidad_min: 5,
          inicializado: false
        }
      });
      logger.info('Institución creada con valores por defecto');
    }

    res.json(institucion);
  } catch (error) {
    logger.error('Error al obtener institución:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos de la institución',
      detalle: error.message 
    });
  }
});

// PUT /api/institucion - Actualizar datos de la institución
router.put('/', async (req, res) => {
  try {
    const { nombre, logo_base64, logo_path, horario_inicio, margen_puntualidad_min } = req.body;

    const institucion = await prisma.institucion.upsert({
      where: { id: 1 },
      update: {
        ...(nombre && { nombre }),
        ...(logo_base64 !== undefined && { logo_base64 }),
        ...(logo_path !== undefined && { logo_path }),
        ...(horario_inicio && { horario_inicio }),
        ...(margen_puntualidad_min !== undefined && { margen_puntualidad_min }),
        inicializado: true
      },
      create: {
        id: 1,
        nombre: nombre || 'Mi Institución Educativa',
        logo_base64,
        logo_path,
        horario_inicio: horario_inicio || '07:00',
        margen_puntualidad_min: margen_puntualidad_min || 5,
        inicializado: true
      }
    });

    logger.info('Institución actualizada:', { id: institucion.id, nombre: institucion.nombre });
    res.json(institucion);
  } catch (error) {
    logger.error('Error al actualizar institución:', error);
    res.status(500).json({ 
      error: 'Error al actualizar institución',
      detalle: error.message 
    });
  }
});

module.exports = router;
