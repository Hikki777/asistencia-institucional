const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const { verifyJWT } = require('../middlewares/auth');
const { logger } = require('../utils/logger');

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
        rol: true,
        activo: true,
        creado_en: true
      },
      orderBy: { creado_en: 'desc' }
    });

    res.json({ usuarios });
  } catch (error) {
    logger.error({ err: error }, '❌ Error obteniendo usuarios');
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

/**
 * POST /api/usuarios
 * Crear nuevo usuario
 */
router.post('/', async (req, res) => {
  try {
    // Validar permisos de admin
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado. Solo administradores pueden crear usuarios.' });
    }

    const { email, password, nombres, apellidos, cargo, rol } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Verificar si ya existe
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hash_pass = await bcrypt.hash(password, salt);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        hash_pass,
        nombres,
        apellidos,
        cargo,
        rol: rol || 'operador',
        activo: true
      },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        rol: true,
        activo: true
      }
    });

    logger.info({ usuario_id: usuario.id, email }, '[OK] Usuario creado exitosamente');
    res.status(201).json({ message: 'Usuario creado', usuario });

  } catch (error) {
    logger.error({ err: error }, '❌ Error creando usuario');
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
    logger.error({ err: error }, '❌ Error eliminando usuario');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
