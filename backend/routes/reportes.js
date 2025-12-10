const express = require('express');
const reportService = require('../services/reportService');
const { verifyJWT } = require('../middlewares/auth');
const { reportLimiter } = require('../middlewares/rateLimiter');
const { validarGenerarReporte } = require('../middlewares/validation');
const { logger } = require('../utils/logger');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyJWT);

/**
 * POST /api/reportes/pdf
 * Generar reporte en PDF con filtros
 */
router.post('/pdf', reportLimiter, validarGenerarReporte, async (req, res) => {
  try {
    const filtros = req.body;
    
    logger.info({ filtros }, '📄 Generando reporte PDF');
    
    // Generar Buffer
    const data = await reportService.generarReportePDF(filtros);
    
    // Enviar JSON Data
    res.json(data);
  } catch (error) {
    logger.error({ err: error, filtros: req.body }, '❌ Error generando reporte PDF');
    res.status(500).json({ error: error.message });
  }
});


/**
 * POST /api/reportes/excel
 * Generar reporte en Excel con filtros
 */
router.post('/excel', reportLimiter, validarGenerarReporte, async (req, res) => {
  try {
    const filtros = req.body;
    
    logger.info({ filtros }, '📊 Generando reporte Excel');
    
    const data = await reportService.generarReporteExcel(filtros);
    
    res.json(data);

  } catch (error) {
    logger.error({ err: error, filtros: req.body }, '❌ Error generando reporte Excel');
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /api/reportes/alumno/:id/pdf
 * Generar reporte PDF de un alumno específico
 */
router.get('/alumno/:id/pdf', async (req, res) => {
  try {
    const alumnoId = req.params.id;
    
    logger.info({ alumnoId }, '📄 Generando reporte PDF para alumno');
    
    const data = await reportService.generarReporteAlumno(alumnoId, 'pdf');
    
    res.json(data);

  } catch (error) {
    logger.error({ err: error, alumnoId: req.params.id }, '❌ Error generando reporte PDF de alumno');
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /api/reportes/alumno/:id/excel
 * Generar reporte Excel de un alumno específico
 */
router.get('/alumno/:id/excel', async (req, res) => {
  try {
    const alumnoId = req.params.id;
    
    logger.info({ alumnoId }, '📊 Generando reporte Excel para alumno');
    
    const data = await reportService.generarReporteAlumno(alumnoId, 'excel');
    
    res.json(data);

  } catch (error) {
    logger.error({ err: error, alumnoId: req.params.id }, '❌ Error generando reporte Excel de alumno');
    res.status(500).json({ error: error.message });
  }
});


/**
 * POST /api/reportes/limpiar
 * Limpiar archivos temporales antiguos (admin only)
 */
router.post('/limpiar', async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    await reportService.limpiarArchivosTemporales();
    
    res.json({ success: true, message: 'Archivos temporales limpiados' });
  } catch (error) {
    logger.error({ err: error, userId: req.user.id }, '❌ Error limpiando archivos temporales');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
