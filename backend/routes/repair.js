const express = require('express');
const diagnosticsService = require('../services/diagnosticsService');
const repairService = require('../services/repairService');
const backupService = require('../services/backupService');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Aplicar autenticación a todas las rutas de diagnóstico/reparación
router.use(verifyJWT);

/**
 * GET /api/diagnostics/qrs
 * Ejecutar diagnóstico y devolver QR faltantes/corruptos
 */
router.get('/qrs', async (req, res) => {
  try {
    logger.info({ userId: req.user?.id }, '🔍 Diagnóstico de QRs iniciado');
    
    const resultado = await diagnosticsService.ejecutarDiagnosticos();

    // Registrar en auditoria
    await diagnosticsService.registrarDiagnostico(null, resultado);

    res.json(resultado);
  } catch (error) {
    logger.error({ err: error }, '❌ Error ejecutando diagnóstico de QRs');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/diagnostics/historial
 * Obtener historial de diagnósticos
 */
router.get('/historial', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const historial = await diagnosticsService.obtenerHistorial(limit);

    res.json({
      total: historial.length,
      historial: historial.map(h => ({
        id: h.id,
        timestamp: h.timestamp,
        accion: h.accion,
        detalle: JSON.parse(h.detalle || '{}')
      }))
    });
  } catch (error) {
    logger.error({ err: error, limit: req.query.limit }, '❌ Error obteniendo historial de diagnósticos');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/repair/qrs/regenerate
 * Regenerar QR específicos o todos
 * Body: { ids: [1, 2, 3], all: false }
 */
router.post('/qrs/regenerate', async (req, res) => {
  try {
    const { ids = [], all = false } = req.body;
    const userId = req.body.userId || null;

    logger.info({ ids: ids.length, all, userId }, '🔧 Regeneración de QRs solicitada');

    // Ejecutar reparación
    const resultado = await repairService.regenerarQrs({
      ids,
      all,
      userId
    });

    res.json({
      success: true,
      resultado
    });
  } catch (error) {
    logger.error({ err: error, ids: req.body.ids, all: req.body.all }, '❌ Error regenerando QRs');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/repair/logo/regenerate
 * Regenerar logo desde logo_base64 en BD
 */
router.post('/logo/regenerate', async (req, res) => {
  try {
    const userId = req.body.userId || null;

    logger.info({ userId }, '🔧 Regeneración de logo solicitada');

    const resultado = await repairService.regenerarLogo(userId);

    if (!resultado.success) {
      return res.status(400).json(resultado);
    }

    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    logger.error({ err: error, userId: req.body.userId }, '❌ Error regenerando logo');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/repair/auto
 * Ejecutar auto-reparación manual
 */
router.post('/auto', async (req, res) => {
  try {
    logger.info({ userId: req.user?.id }, '🔧 Auto-reparación manual iniciada');

    const resultado = await repairService.autoRepair();

    res.json({
      success: true,
      resultado
    });
  } catch (error) {
    logger.error({ err: error }, '❌ Error en auto-reparación');
    res.status(500).json({ error: error.message });
  }


/**
 * POST /api/repair/backup/cloud
 * Subir backup local a la nube
 */
router.post('/backup/cloud', async (req, res) => {
  try {
    const { backupName } = req.body;
    if (!backupName) {
      return res.status(400).json({ error: 'Falta backupName' });
    }

    const url = await backupService.subirBackupNube(backupName);
    
    res.json({ success: true, url });
  } catch (error) {
    logger.error({ err: error, backupName: req.body.backupName }, '❌ Error subiendo backup');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
