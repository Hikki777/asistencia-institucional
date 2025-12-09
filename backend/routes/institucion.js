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
          horario_salida: '13:00',
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

// POST /api/institucion/init - Inicializar institución (Setup Wizard)
router.post('/init', async (req, res) => {
  try {
    const { 
      nombre, 
      horario_inicio, 
      horario_salida, 
      margen_puntualidad_min,
      direccion,
      pais,
      departamento,
      email,
      telefono,
      logo_base64,
      admin_email,
      admin_password
    } = req.body;

    // 1. Guardar logo si existe
    let logoUrl = null;
    if (logo_base64) {
      try {
        logoUrl = await require('../services/qrService').guardarLogo(logo_base64, 'logo.png');
      } catch (e) {
        logger.warn('No se pudo guardar el logo, continuando sin él', e);
      }

    await prisma.usuario.upsert({
      where: { email: admin_email },
      update: {
        hash_pass,
        rol: 'admin',
        activo: true
      },
      create: {
        email: admin_email,
        hash_pass,
        rol: 'admin',
        activo: true
      }
    });

    logger.info('Sistema inicializado correctamente');
    res.json({ success: true, institucion });

  } catch (error) {
    logger.error('Error en inicialización:', error);
    res.status(500).json({ 
      error: 'Error al inicializar el sistema',
      detalle: error.message 
    });
  }
});

// PUT /api/institucion - Actualizar datos de la institución
router.put('/', async (req, res) => {
  try {
    const { nombre, logo_base64, logo_path, horario_inicio, margen_puntualidad_min, pais, departamento } = req.body;

    // Guardar logo si se proporciona
    let logoUrl = null;
    if (logo_base64) {
      // Usamos qrService (que ahora usa Cloudinary) para guardar el logo
      logoUrl = await require('../services/qrService').guardarLogo(logo_base64, 'logo.png');
      create: {
        id: 1,
        nombre: nombre || 'Mi Institución Educativa',
        logo_base64,
        logo_path: logoUrl, // Guardamos la URL
        horario_inicio: horario_inicio || '07:00',
        margen_puntualidad_min: margen_puntualidad_min || 5,
        pais,
        departamento,
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
