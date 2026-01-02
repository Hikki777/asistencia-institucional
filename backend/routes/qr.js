const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const prisma = require('../prismaClient');
const qrService = require('../services/qrService');
const tokenService = require('../services/tokenService');
const { verifyJWT } = require('../middlewares/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Aplicar autenticación a todas las rutas de QR
router.use(verifyJWT);

/**
 * POST /api/qr/generar
 * Generar QR con logo para una persona
 * Body: { persona_tipo, persona_id }
 */
router.post('/generar', async (req, res) => {
  try {
    const { persona_tipo, persona_id } = req.body;

    if (!persona_tipo || !persona_id) {
      return res.status(400).json({
        error: 'Faltan parámetros: persona_tipo, persona_id'
      });
    }

    if (!['alumno', 'personal'].includes(persona_tipo)) {
      return res.status(400).json({
        error: 'persona_tipo debe ser "alumno" o "personal"'
      });
    }

    // Obtener institución y logo
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    if (!institucion || !institucion.logo_base64) {
      return res.status(400).json({
        error: 'Institución no inicializada o logo faltante'
      });
    }

    // Obtener persona
    let persona;
    if (persona_tipo === 'alumno') {
      persona = await prisma.alumno.findUnique({ where: { id: persona_id } });
    } else {
      persona = await prisma.personal.findUnique({ where: { id: persona_id } });
    }

    if (!persona) {
      return res.status(404).json({
        error: `${persona_tipo} con id ${persona_id} no encontrado`
      });
    }

    // Verificar si ya existe QR
    let codigoQr = await prisma.codigoQr.findFirst({
      where: {
        persona_tipo,
        ...(persona_tipo === 'alumno' ? { alumno_id: persona_id } : { personal_id: persona_id })
      }
    });

    // Si no existe, crear uno nuevo
    if (!codigoQr) {
      const token = tokenService.generarToken(persona_tipo, persona_id);
      
      const createData = {
        persona_tipo,
        token,
        vigente: true
      };

      if (persona_tipo === 'alumno') {
        createData.alumno_id = persona_id;
      } else {
        createData.personal_id = persona_id;
      }

      codigoQr = await prisma.codigoQr.create({ data: createData });
    }

    // Generar rutas
    const { filename } = qrService.obtenerRutasQr(
      persona_tipo,
      persona.carnet
    );

    // Generar PNG con logo
    const qrUrl = await qrService.generarQrConLogo(
      codigoQr.token,
      institucion.logo_base64,
      filename
    );

    if (!qrUrl) {
      return res.status(500).json({
        error: 'Error generando QR'
      });
    }

    // Actualizar BD
    // Guardamos la URL completa en png_path (aunque el nombre del campo sea path)
    await prisma.codigoQr.update({
      where: { id: codigoQr.id },
      data: {
        png_path: qrUrl,
        generado_en: new Date()
      }
    });

    // Registrar en auditoria
    await prisma.auditoria.create({
      data: {
        entidad: 'CodigoQr',
        entidad_id: codigoQr.id,
        accion: 'crear',
        detalle: JSON.stringify({
          persona_tipo,
          persona_id,
          carnet: persona.carnet,
          url: qrUrl
        })
      }
    });

    logger.info({ persona_tipo, carnet: persona.carnet, qrId: codigoQr.id }, `[OK] QR generado: ${persona_tipo}/${persona.carnet}`);

    res.status(201).json({
      success: true,
      codigo_qr: {
        id: codigoQr.id,
        token: codigoQr.token.substring(0, 30) + '...',
        png_url: qrUrl, // Devolvemos la URL directa
        persona: {
          tipo: persona_tipo,
          nombre: `${persona.nombres} ${persona.apellidos}`,
          carnet: persona.carnet
        }
      }
    });
  } catch (error) {
    logger.error({ err: error, body: req.body }, '[ERROR] Error generando QR');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/qr/:id/png
 * Servir PNG del QR
 * Si falta, intenta regenerar automáticamente
 */
router.get('/:id/png', async (req, res) => {
  try {
    const { id } = req.params;
    const codigoQr = await prisma.codigoQr.findUnique({
      where: { id: parseInt(id) },
      include: {
        alumno: true,
        personal: true
      }
    });

    if (!codigoQr) {
      return res.status(404).json({ error: 'QR no encontrado' });
    }

    // Si es una URL (empieza con http), redirigir
    if (codigoQr.png_path && codigoQr.png_path.startsWith('http')) {
      return res.redirect(codigoQr.png_path);
    }

    // Si es ruta local (legado), intentar servirla
    if (codigoQr.png_path) {
      const pngPath = path.join(__dirname, '../../uploads', codigoQr.png_path);
      if (await fs.pathExists(pngPath)) {
        return res.sendFile(pngPath);
      }
    }

    // PNG falta: intentar regenerar
    logger.warn({ qrId: id }, `[WARNING] PNG faltante para QR ${id}, regenerando...`);

    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    if (!institucion || !institucion.logo_base64) {
      return res.status(500).json({
        error: 'No se puede regenerar sin logo'
      });
    }

    let persona;
    let carnet;
    if (codigoQr.persona_tipo === 'alumno') {
      persona = codigoQr.alumno;
      carnet = persona?.carnet;
    } else {
      persona = codigoQr.personal;
      carnet = persona?.carnet;
    }

    if (!carnet) {
      return res.status(500).json({
        error: 'Persona asociada no encontrada'
      });
    }

    // Regenerar
    const { filename } = qrService.obtenerRutasQr(
      codigoQr.persona_tipo,
      carnet
    );

    const qrUrl = await qrService.generarQrConLogo(
      codigoQr.token,
      institucion.logo_base64,
      filename
    );

    if (!qrUrl) {
      return res.status(500).json({
        error: 'Error regenerando QR'
      });
    }

    // Actualizar BD
    await prisma.codigoQr.update({
      where: { id: codigoQr.id },
      data: {
        png_path: qrUrl,
        regenerado_en: new Date()
      }
    });

    // Registrar regeneración
    await prisma.auditoria.create({
      data: {
        entidad: 'CodigoQr',
        entidad_id: codigoQr.id,
        accion: 'regenerar',
        detalle: JSON.stringify({ trigger: 'on_demand', url: qrUrl })
      }
    });

    logger.info({ qrId: codigoQr.id, persona_tipo: codigoQr.persona_tipo, carnet }, '[OK] QR regenerado y servido');

    res.redirect(qrUrl);
  } catch (error) {
    logger.error({ err: error, qrId: req.params.id }, '[ERROR] Error sirviendo/regenerando QR PNG');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/qr/listar
 * Listar todos los QR
 */
router.get('/listar/todos', async (req, res) => {
  try {
    const qrs = await prisma.codigoQr.findMany({
      select: {
        id: true,
        persona_tipo: true,
        token: true,
        png_path: true,
        vigente: true,
        generado_en: true,
        regenerado_en: true,
        alumno: { select: { carnet: true, nombres: true, apellidos: true } },
        personal: { select: { carnet: true, nombres: true, apellidos: true } }
      },
      take: 100
    });

    res.json({
      total: qrs.length,
      qrs: qrs.map(q => ({
        ...q,
        token: q.token.substring(0, 20) + '...',
        persona: q.alumno || q.personal
      }))
    });
  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error listando QRs');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
