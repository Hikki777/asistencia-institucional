const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  validarCrearDocente, 
  validarActualizarDocente, 
  validarId 
} = require('../middlewares/validation');
const { logger } = require('../utils/logger');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../middlewares/cache');

// Configurar multer para subida de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/fotos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `docente-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
    }
  }
});

// GET /api/docentes - Listar todos los docentes con paginación cursor (sin caché temporalmente)
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    const estado = req.query.estado; // Sin valor por defecto, traer todos

    const whereClause = estado ? { estado } : {}; // Si hay estado, filtrar, sino traer todos

    const docentes = await prisma.personal.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { id: 'asc' },
      include: {
        codigos_qr: {
          where: { vigente: true },
          select: { id: true, token: true, png_path: true }
        }
      }
    });

    const hasMore = docentes.length > limit;
    const items = hasMore ? docentes.slice(0, limit) : docentes;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await prisma.personal.count({ where: whereClause });

    res.json({
      total,
      count: items.length,
      personal: items,
      pagination: {
        nextCursor,
        hasMore,
        limit
      }
    });
  } catch (error) {
    logger.error({ err: error, query: req.query }, '❌ Error al listar docentes');
    res.status(500).json({ error: error.message });
  }
});

// GET /api/docentes/:id - Obtener un docente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const docente = await prisma.personal.findUnique({
      where: { id: parseInt(id) },
      include: {
        codigos_qr: {
          where: { vigente: true }
        },
        asistencias: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!docente) {
      logger.warn({ docenteId: req.params.id }, '⚠️ Docente no encontrado');
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    res.json({ docente });
  } catch (error) {
    logger.error({ err: error, docenteId: req.params.id }, '❌ Error al obtener docente');
    res.status(500).json({ error: error.message });
  }
});

// POST /api/docentes - Crear nuevo docente
router.post('/', invalidateCacheMiddleware('/api/docentes'), (req, res, next) => {
  // Solo aplicar multer si el Content-Type es multipart/form-data
  if (req.is('multipart/form-data')) {
    upload.single('foto')(req, res, next);
  } else {
    next();
  }
}, validarCrearDocente, async (req, res) => {
  try {
    const { carnet, nombres, apellidos, sexo, cargo, jornada } = req.body;

    // Validar campos requeridos
    if (!carnet || !nombres || !apellidos) {
      return res.status(400).json({ error: 'Carnet, nombres y apellidos son obligatorios' });
    }

    // Verificar si ya existe el carnet
    const existente = await prisma.personal.findUnique({
      where: { carnet }
    });

    if (existente) {
      return res.status(400).json({ error: 'Ya existe un docente con ese carnet' });
    }

    const foto_path = req.file ? `uploads/fotos/${req.file.filename}` : null;

    const docente = await prisma.personal.create({
      data: {
        carnet,
        nombres,
        apellidos,
        sexo: sexo || null,
        cargo: cargo || 'Docente',
        jornada: jornada || null,
        foto_path
      }
    });

    logger.info({ docenteId: docente.id, carnet, nombres, apellidos }, '✅ Docente creado');
    res.status(201).json({ docente });
  } catch (error) {
    logger.error({ err: error, body: req.body }, '❌ Error al crear docente');
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/docentes/:id - Actualizar docente
router.put('/:id', invalidateCacheMiddleware('/api/docentes'), (req, res, next) => {
  // Solo aplicar multer si el Content-Type es multipart/form-data
  if (req.is('multipart/form-data')) {
    upload.single('foto')(req, res, next);
  } else {
    next();
  }
}, validarActualizarDocente, async (req, res) => {
  try {
    const { id } = req.params;
    const { carnet, nombres, apellidos, sexo, cargo, jornada, estado } = req.body;

    const docente = await prisma.personal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    // Si hay nueva foto, eliminar la anterior
    if (req.file && docente.foto_path) {
      const oldPath = path.join(__dirname, '../../', docente.foto_path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const foto_path = req.file ? `uploads/fotos/${req.file.filename}` : docente.foto_path;

    const docenteActualizado = await prisma.personal.update({
      where: { id: parseInt(id) },
      data: {
        carnet: carnet || docente.carnet,
        nombres: nombres || docente.nombres,
        apellidos: apellidos || docente.apellidos,
        sexo: sexo !== undefined ? sexo : docente.sexo,
        cargo: cargo || docente.cargo,
        jornada: jornada !== undefined ? jornada : docente.jornada,
        estado: estado || docente.estado,
        foto_path
      }
    });

    logger.info({ docenteId: id, campos: Object.keys(req.body) }, '✅ Docente actualizado');
    res.json({ docente: docenteActualizado });
  } catch (error) {
    logger.error({ err: error, docenteId: req.params.id }, '❌ Error al actualizar docente');
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/docentes/:id - Eliminar docente
router.delete('/:id', invalidateCacheMiddleware('/api/docentes'), async (req, res) => {
  try {
    const { id } = req.params;

    const docente = await prisma.personal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    // Eliminar foto si existe
    if (docente.foto_path) {
      const fotoPath = path.join(__dirname, '../../', docente.foto_path);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    await prisma.personal.delete({
      where: { id: parseInt(id) }
    });

    logger.info({ docenteId: id, nombres: docente.nombres, apellidos: docente.apellidos }, '✅ Docente eliminado');
    res.json({ message: 'Docente eliminado correctamente' });
  } catch (error) {
    logger.error({ err: error, docenteId: req.params.id }, '❌ Error al eliminar docente');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;



