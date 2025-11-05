const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { signJWT, verifyJWT } = require('../middlewares/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
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
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signJWT(user);
    return res.json({
      accessToken: token,
      user: { id: user.id, email: user.email, rol: user.rol }
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err.message);
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
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user);
  } catch (err) {
    console.error('[GET /api/auth/me]', err.message);
    return res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

module.exports = router;
