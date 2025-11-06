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
    
    const { filePath, fileName } = await reportService.generarReportePDF(filtros);
    
    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error({ err, fileName }, '❌ Error enviando PDF');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      // Limpiar archivo después de enviar (con delay)
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
          logger.debug({ fileName }, '🗑️ Archivo temporal eliminado');
        } catch (error) {
          logger.error({ err: error, fileName }, '❌ Error eliminando archivo temporal');
        }
      }, 5000);
    });
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
    
    const { filePath, fileName } = await reportService.generarReporteExcel(filtros);
    
    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error({ err, fileName }, '❌ Error enviando Excel');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      // Limpiar archivo después de enviar (con delay)
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
          logger.debug({ fileName }, '🗑️ Archivo temporal eliminado');
        } catch (error) {
          logger.error({ err: error, fileName }, '❌ Error eliminando archivo temporal');
        }
      }, 5000);
    });
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
    
    const { filePath, fileName } = await reportService.generarReporteAlumno(alumnoId, 'pdf');
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error({ err, fileName, alumnoId }, '❌ Error enviando PDF');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
        } catch (error) {
          logger.error({ err: error, fileName }, '❌ Error eliminando archivo temporal');
        }
      }, 5000);
    });
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
    
    const { filePath, fileName } = await reportService.generarReporteAlumno(alumnoId, 'excel');
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error({ err, fileName, alumnoId }, '❌ Error enviando Excel');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
        } catch (error) {
          logger.error({ err: error, fileName }, '❌ Error eliminando archivo temporal');
        }
      }, 5000);
    });
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
