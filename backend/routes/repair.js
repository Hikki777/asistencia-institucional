const express = require('express');
const diagnosticsService = require('../services/diagnosticsService');
const repairService = require('../services/repairService');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas de diagnóstico/reparación
router.use(verifyJWT);

/**
 * GET /api/diagnostics/qrs
 * Ejecutar diagnóstico y devolver QR faltantes/corruptos
 */
router.get('/qrs', async (req, res) => {
  try {
    console.log('[GET /api/diagnostics/qrs] Diagnostic triggered');
    
    const resultado = await diagnosticsService.ejecutarDiagnosticos();

    // Registrar en auditoria
    await diagnosticsService.registrarDiagnostico(null, resultado);

    res.json(resultado);
  } catch (error) {
    console.error('[GET /api/diagnostics/qrs]', error.message);
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
    console.error('[GET /api/diagnostics/historial]', error.message);
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

    console.log('[POST /api/repair/qrs/regenerate]', { ids, all });

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
    console.error('[POST /api/repair/qrs/regenerate]', error.message);
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

    console.log('[POST /api/repair/logo/regenerate]');

    const resultado = await repairService.regenerarLogo(userId);

    if (!resultado.success) {
      return res.status(400).json(resultado);
    }

    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('[POST /api/repair/logo/regenerate]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/repair/auto
 * Ejecutar auto-reparación manual
 */
router.post('/auto', async (req, res) => {
  try {
    console.log('[POST /api/repair/auto] Manual auto-repair triggered');

    const resultado = await repairService.autoRepair();

    res.json({
      success: true,
      resultado
    });
  } catch (error) {
    console.error('[POST /api/repair/auto]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
