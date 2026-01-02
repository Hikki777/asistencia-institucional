const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyJWT, verifyAdmin } = require('../middlewares/auth');
const { logger } = require('../utils/logger');

// Middleware de seguridad
router.use(verifyJWT);
router.use(verifyAdmin);

/**
 * POST /api/admin/reset-factory
 * Reiniciar sistema borrando datos transaccionales, manteniendo configuración y usuarios
 */
router.post('/reset-factory', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Verificación adicional de seguridad (confirmar contraseña del admin actual)
    if (!password) {
      return res.status(400).json({ error: 'Se requiere contraseña para confirmar el reset de fábrica' });
    }

    // Verificar contraseña del usuario actual
    const bcrypt = require('bcrypt');
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { hash_pass: true }
    });

    const passwordValida = await bcrypt.compare(password, usuario.hash_pass);
    if (!passwordValida) {
      logger.warn({ user: req.user.id }, '[WARNING] Intento de reset de fábrica con contraseña incorrecta');
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    logger.warn({ user: req.user.id }, '[WARNING] INICIANDO RESET DE FÁBRICA');

    await prisma.$transaction([
      // 1. Borrar datos transaccionales
      prisma.asistencia.deleteMany(),
      prisma.excusa.deleteMany(),
      prisma.codigoQr.deleteMany(),
      prisma.diagnosticResult.deleteMany(),
      prisma.auditoria.deleteMany(), // Opcional, quizás mantener logs

      // 2. Borrar entidades (Alumnos, Personal)
      prisma.alumno.deleteMany(),
      prisma.personal.deleteMany(),

      // 3. Resetear configuración institucional a default (Opcional, el usuario pidió "De fábrica")
      // prisma.institucion.update({ where: { id: 1 }, data: { inicializado: false, ... } }) 
    ]);

    logger.info('[SUCCESS] Sistema restablecido de fábrica exitosamente');
    res.json({ success: true, message: 'Sistema restablecido correctamente' });

  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error en Factory Reset');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
