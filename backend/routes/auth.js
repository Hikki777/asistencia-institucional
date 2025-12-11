const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { signJWT, verifyJWT } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { validarLogin } = require('../middlewares/validation');
const { logger } = require('../utils/logger');

const router = express.Router();

// POST /api/auth/login - Con rate limiting y validación
router.post('/login', loginLimiter, validarLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(password, user.hash_pass);
    if (!ok) {
      logger.warn({ email, userId: user.id }, '[WARNING] Intento de login con contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signJWT(user);
    logger.info({ userId: user.id, email, rol: user.rol }, '[OK] Login exitoso');
    
    return res.json({
      accessToken: token,
      user: { id: user.id, email: user.email, rol: user.rol }
    });
  } catch (err) {
    logger.error({ err, email: req.body.email }, '❌ Error en login');
    return res.status(500).json({ error: 'Error iniciando sesión' });
  }
});

// GET /api/auth/me
router.get('/me', verifyJWT, async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: Number(req.user.id) },
      select: { id: true, email: true, rol: true, activo: true, creado_en: true }
    });
    if (!user) {
      logger.warn({ userId: req.user.id }, '[WARNING] Usuario no encontrado en /me');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json(user);
  } catch (err) {
    logger.error({ err, userId: req.user?.id }, '❌ Error obteniendo perfil de usuario');
    return res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

module.exports = router;
