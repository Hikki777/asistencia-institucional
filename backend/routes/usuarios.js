const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const { verifyJWT } = require('../middlewares/auth');
const { logger } = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { UPLOADS_DIR } = require('../utils/paths');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = path.join(UPLOADS_DIR, 'usuarios');
    await fs.ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // user-ID-timestamp.ext
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.params.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyJWT);

/**
 * GET /api/usuarios
 * Obtener todos los usuarios
 */
router.get('/', async (req, res) => {
  try {
    // Verificar rol (opcional, por ahora todos los autenticados pueden ver o solo admin?)
    // Dejemos que todos vean la lista básica, pero solo admin crea/borra
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        cargo: true,
        jornada: true,
        foto_path: true,
        rol: true,
        activo: true,
        creado_en: true
      },
      orderBy: { creado_en: 'desc' }
    });

    res.json({ usuarios });
  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error obteniendo usuarios');
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

/**
 * POST /api/usuarios
 * Crear nuevo usuario
 */
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    // Validar permisos de admin
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado. Solo administradores pueden crear usuarios.' });
    }

    const { email, password, nombres, apellidos, cargo, jornada, rol } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Verificar si ya existe
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      // Si se subió una foto pero el usuario ya existe, multer ya la guardó. 
      // Podríamos borrarla aquí, pero por simplicidad la dejamos o confiamos en limpiezas periódicas.
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hash_pass = await bcrypt.hash(password, salt);

    // Determinar foto_path si existe archivo
    const foto_path = req.file ? `usuarios/${req.file.filename}` : null;

    const usuario = await prisma.usuario.create({
      data: {
        email,
        hash_pass,
        nombres,
        apellidos,
        cargo,
        jornada,
        foto_path,
        rol: rol || 'operador',
        activo: true
      },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        rol: true,
        activo: true,
        foto_path: true
      }
    });

    logger.info({ usuario_id: usuario.id, email }, '[OK] Usuario creado exitosamente');
    res.status(201).json({ message: 'Usuario creado', usuario });

  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error creando usuario');
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/usuarios/:id
 * Eliminar usuario
 */
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado.' });
    }

    const id = parseInt(req.params.id);

    // Evitar auto-eliminación
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    await prisma.usuario.delete({
      where: { id }
    });

    logger.info({ eliminado_id: id, por_admin: req.user.id }, '[DELETE] Usuario eliminado');
    res.json({ success: true, message: 'Usuario eliminado correctamente' });

  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error eliminando usuario');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/usuarios/:id/foto
 * Subir foto de perfil
 */
router.post('/:id/foto', upload.single('foto'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar permisos: Admin o el mismo usuario
    if (req.user.rol !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const relativePath = `usuarios/${req.file.filename}`;

    // Actualizar usuario
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { foto_path: relativePath },
      select: { id: true, email: true, foto_path: true }
    });

    logger.info({ usuario_id: id }, '[OK] Foto de perfil actualizada');
    res.json({ message: 'Foto actualizada', usuario });

  } catch (error) {
    logger.error({ err: error }, '[ERROR] Subiendo foto usuario');
    res.status(500).json({ error: 'Error al subir la foto' });
  }
});

module.exports = router;
