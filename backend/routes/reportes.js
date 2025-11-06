const express = require('express');
const reportService = require('../services/reportService');
const { verifyJWT } = require('../middlewares/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verifyJWT);

/**
 * POST /api/reportes/pdf
 * Generar reporte en PDF con filtros
 */
router.post('/pdf', async (req, res) => {
  try {
    const filtros = req.body;
    
    console.log('📄 Generando reporte PDF con filtros:', filtros);
    
    const { filePath, fileName } = await reportService.generarReportePDF(filtros);
    
    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error enviando PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      // Limpiar archivo después de enviar (con delay)
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
          console.log(`✅ Archivo temporal eliminado: ${fileName}`);
        } catch (error) {
          console.error('Error eliminando archivo temporal:', error);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('[POST /api/reportes/pdf]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reportes/excel
 * Generar reporte en Excel con filtros
 */
router.post('/excel', async (req, res) => {
  try {
    const filtros = req.body;
    
    console.log('📊 Generando reporte Excel con filtros:', filtros);
    
    const { filePath, fileName } = await reportService.generarReporteExcel(filtros);
    
    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error enviando Excel:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      // Limpiar archivo después de enviar (con delay)
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
          console.log(`✅ Archivo temporal eliminado: ${fileName}`);
        } catch (error) {
          console.error('Error eliminando archivo temporal:', error);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('[POST /api/reportes/excel]', error.message);
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
    
    console.log(`📄 Generando reporte PDF para alumno ID: ${alumnoId}`);
    
    const { filePath, fileName } = await reportService.generarReporteAlumno(alumnoId, 'pdf');
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error enviando PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error eliminando archivo temporal:', error);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('[GET /api/reportes/alumno/:id/pdf]', error.message);
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
    
    console.log(`📊 Generando reporte Excel para alumno ID: ${alumnoId}`);
    
    const { filePath, fileName } = await reportService.generarReporteAlumno(alumnoId, 'excel');
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error enviando Excel:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      }
      
      setTimeout(async () => {
        try {
          const fs = require('fs-extra');
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error eliminando archivo temporal:', error);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('[GET /api/reportes/alumno/:id/excel]', error.message);
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
    console.error('[POST /api/reportes/limpiar]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
