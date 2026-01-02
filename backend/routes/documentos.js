const express = require('express');
const router = express.Router();
const { verifyJWT, verifyAdmin } = require('../middlewares/auth');
const { logger } = require('../utils/logger');
const documentService = require('../services/documentService');

/**
 * Rutas para generación de documentos oficiales
 */

// Generar constancia de inscripción
router.post('/constancia-inscripcion/:alumnoId', verifyJWT, async (req, res) => {
  try {
    const alumnoId = parseInt(req.params.alumnoId);
    
    const resultado = await documentService.generarConstanciaInscripcion(alumnoId);
    
    res.json({
      success: true,
      message: 'Constancia de inscripción generada exitosamente',
      data: resultado
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generando constancia de inscripción');
    res.status(500).json({
      success: false,
      error: 'Error generando constancia de inscripción'
    });
  }
});

// Generar carta de buena conducta
router.post('/carta-conducta/:alumnoId', verifyJWT, async (req, res) => {
  try {
    const alumnoId = parseInt(req.params.alumnoId);
    const { periodo } = req.body; // { inicio: Date, fin: Date } opcional
    
    const resultado = await documentService.generarCartaBuenaConducta(alumnoId, periodo);
    
    res.json({
      success: true,
      message: 'Carta de buena conducta generada exitosamente',
      data: resultado
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generando carta de buena conducta');
    res.status(500).json({
      success: false,
      error: 'Error generando carta de buena conducta'
    });
  }
});

// Generar certificado de estudios
router.post('/certificado-estudios/:alumnoId', verifyJWT, async (req, res) => {
  try {
    const alumnoId = parseInt(req.params.alumnoId);
    
    const resultado = await documentService.generarCertificadoEstudios(alumnoId);
    
    res.json({
      success: true,
      message: 'Certificado de estudios generado exitosamente',
      data: resultado
    });
  } catch (error) {
    logger.error({ err: error }, 'Error generando certificado de estudios');
    res.status(500).json({
      success: false,
      error: 'Error generando certificado de estudios'
    });
  }
});

module.exports = router;
