const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { logger } = require('../utils/logger');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { UPLOADS_DIR } = require('../utils/paths');

// Configuración de Multer para logos y fotos de admin
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    let dir = UPLOADS_DIR;
    if (file.fieldname === 'logo') {
      dir = path.join(dir, 'logos');
    } else if (file.fieldname === 'admin_foto') {
      dir = path.join(dir, 'usuarios');
    }
    await fs.ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'logo' ? 'logo' : 'admin';
    cb(null, `${prefix}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});
// Importar servicio QR al inicio para detectar errores de carga
const qrService = require('../services/qrService');

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
router.post('/init', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'admin_foto', maxCount: 1 }]), [
  // Validaciones (Nota: al usar multer, req.body se procesa después de los archivos)
  check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  check('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  check('admin_email').isEmail().withMessage('Email de administrador inválido'),
  check('admin_password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      nombre,
      horario_inicio,
      horario_salida,
      margen_puntualidad_min: margen, // Renamed to 'margen' for clarity with the new logic
      direccion,
      pais,
      departamento,
      email, // Email institucional
      telefono,
      admin_email,
      admin_password,
      admin_nombres,
      admin_apellidos,
      admin_cargo,
      admin_jornada,
      municipio
    } = req.body;

    // DEBUG: Loguear cuerpo de la petición
    const debugBody = { ...req.body };
    logger.info({ body: debugBody, files: req.files }, '[DEBUG] Entering /init route');

    if (!nombre || !admin_email || !admin_password) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: nombre, admin_email, admin_password'
      });
    }

    // Verificar si ya está inicializado
    const existing = await prisma.institucion.findUnique({ where: { id: 1 } }).catch(() => null);
    if (existing && existing.inicializado) {
      return res.status(400).json({ error: 'La institución ya está inicializada' });
    }

    // Procesar logo
    let logoPath = null;
    if (req.files && req.files['logo'] && req.files['logo'][0]) {
       logoPath = `logos/${req.files['logo'][0].filename}`;
    }

    // Procesar foto admin
    let adminFotoPath = null;
    if (req.files && req.files['admin_foto'] && req.files['admin_foto'][0]) {
       adminFotoPath = `usuarios/${req.files['admin_foto'][0].filename}`;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Crear/Actualizar Institución
      const institucionData = {
        nombre,
        direccion,
        telefono,
        email, // Email institucional
        pais,
        departamento,
        municipio,
        horario_inicio: horario_inicio || '07:00',
        horario_salida: horario_salida || '13:00',
        margen_puntualidad_min: margen ? parseInt(margen) : 5,
        inicializado: true
      };

      if (logoPath) {
        institucionData.logo_path = logoPath;
      }

      const institucion = await tx.institucion.upsert({
        where: { id: 1 },
        update: institucionData,
        create: { id: 1, ...institucionData }
      });

      // 2. Crear Admin
      const hash_pass = await bcrypt.hash(admin_password, 10);

      // Upsert admin para evitar errores si se re-ejecuta
      const adminData = {
        email: admin_email,
        hash_pass,
        nombres: admin_nombres,
        apellidos: admin_apellidos || 'Sistema',
        cargo: admin_cargo,
        jornada: admin_jornada || 'Matutina',
        rol: 'admin',
        activo: true,
        foto_path: adminFotoPath // Guardar foto si existe
      };

      await tx.usuario.upsert({
        where: { email: admin_email },
        update: adminData,
        create: adminData
      });

      logger.info('Sistema inicializado correctamente');
      res.json({ success: true, institucion });
    });

  } catch (error) {
    logger.error('Error en inicialización:', error);
    res.status(500).json({ 
      error: 'Error al inicializar el sistema',
      detalle: error.message 
    });
  }
});

// PUT /api/institucion - Actualizar datos de la institución
router.put('/', upload.fields([
  { name: 'logo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nombre, horario_inicio, horario_salida, margen_puntualidad_min, pais, departamento, municipio, telefono, email, direccion } = req.body;

    // Procesar logo si existe
    let logoPath = null;
    if (req.files && req.files['logo'] && req.files['logo'][0]) {
      logoPath = `logos/${req.files['logo'][0].filename}`;
    }

    const institucionData = {
      nombre,
      direccion,
      telefono,
      email,
      pais,
      departamento,
      municipio,
      horario_inicio: horario_inicio || '07:00',
      horario_salida: horario_salida || '13:00',
      margen_puntualidad_min: parseInt(margen_puntualidad_min) || 5,
    };

    if (logoPath) {
      institucionData.logo_path = logoPath;
    }

    const institucion = await prisma.institucion.upsert({
      where: { id: 1 },
      update: institucionData,
      create: {
        id: 1,
        ...institucionData,
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
