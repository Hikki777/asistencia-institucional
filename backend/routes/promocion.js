const express = require('express');
const router = express.Router();
const promocionService = require('../services/promocionService');
const { logger } = require('../utils/logger');
const { verifyJWT, verifyAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyJWT);
router.use(verifyAdmin);

/**
 * GET /api/migracion/preview
 * Preview de migración de fin de año
 */
router.get('/preview', async (req, res) => {
  try {
    const anioEscolar = parseInt(req.query.anio) || new Date().getFullYear();
    const preview = await promocionService.previewMigracion(anioEscolar);
    
    res.json({
      success: true,
      anioEscolar,
      preview
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generando preview de migración');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migracion/promover
 * Promover alumnos seleccionados
 */
router.post('/promover', async (req, res) => {
  try {
    const { alumnosIds, anioEscolar } = req.body;
    
    if (!alumnosIds || !Array.isArray(alumnosIds)) {
      return res.status(400).json({ error: 'alumnosIds debe ser un array' });
    }
    
    if (!anioEscolar) {
      return res.status(400).json({ error: 'anioEscolar es requerido' });
    }
    
    const resultados = await promocionService.promoverAlumnos(alumnosIds, anioEscolar);
    
    res.json({
      success: true,
      resultados
    });
  } catch (error) {
    logger.error({ err: error }, 'Error promoviendo alumnos');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migracion/graduar
 * Graduar alumnos seleccionados
 */
router.post('/graduar', async (req, res) => {
  try {
    const { alumnoId, anioEscolar } = req.body;
    
    if (!alumnoId) {
      return res.status(400).json({ error: 'alumnoId es requerido' });
    }
    
    await promocionService.graduarAlumno(alumnoId, anioEscolar || new Date().getFullYear());
    
    res.json({
      success: true,
      message: 'Alumno graduado exitosamente'
    });
  } catch (error) {
    logger.error({ err: error }, 'Error graduando alumno');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migracion/retirar
 * Dar de baja a un alumno
 */
router.post('/retirar', async (req, res) => {
  try {
    const { alumnoId, motivo, fecha } = req.body;
    
    if (!alumnoId || !motivo) {
      return res.status(400).json({ error: 'alumnoId y motivo son requeridos' });
    }
    
    await promocionService.retirarAlumno(
      alumnoId,
      motivo,
      fecha ? new Date(fecha) : new Date()
    );
    
    res.json({
      success: true,
      message: 'Alumno retirado exitosamente'
    });
  } catch (error) {
    logger.error({ err: error }, 'Error retirando alumno');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migracion/fin-de-anio
 * Migración masiva de fin de año
 */
router.post('/fin-de-anio', async (req, res) => {
  try {
    const { anioEscolar } = req.body;
    
    if (!anioEscolar) {
      return res.status(400).json({ error: 'anioEscolar es requerido' });
    }
    
    logger.info({ anioEscolar }, 'Iniciando promoción masiva de fin de año');
    
    const resultados = await promocionService.migracionFinDeAnio(anioEscolar);
    
    logger.info({
      promovidos: resultados.promovidos.length,
      graduados: resultados.graduados.length,
      errores: resultados.errores.length
    }, 'Migración masiva completada');
    
    res.json({
      success: true,
      resultados
    });
  } catch (error) {
    logger.error({ err: error }, 'Error en migración masiva');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/migracion/historial/:id
 * Obtener historial académico de un alumno
 */
router.get('/historial/:id', async (req, res) => {
  try {
    const alumnoId = parseInt(req.params.id);
    const historial = await promocionService.getHistorialAlumno(alumnoId);
    
    res.json({
      success: true,
      historial
    });
  } catch (error) {
    logger.error({ err: error, alumnoId: req.params.id }, 'Error obteniendo historial');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
