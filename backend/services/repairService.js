const fs = require('fs-extra');
const path = require('path');
const prisma = require('../prismaClient');
const qrService = require('./qrService');
const tokenService = require('./tokenService');
const { logger } = require('../utils/logger');

/**
 * Servicio de reparación automática de QR y logo
 * Core de auto-recuperación ante fallos
 */

/**
 * Regenerar QR(s) a partir de token y logo_base64
 * @param {Object} opciones - { ids, all, userId }
 * @returns {Promise<Object>} { regenerados, fallidos, detalles }
 */
async function regenerarQrs(opciones = {}) {
  const { ids = [], all = false, userId = null } = opciones;
  const resultado = {
    timestamp: new Date().toISOString(),
    regenerados: [],
    fallidos: [],
    skipped: 0
  };

  try {
    // Obtener logo institucional
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    if (!institucion || !institucion.logo_base64) {
      resultado.fallidos.push({
        reason: 'missing_logo_in_database',
        message: 'No se puede regenerar sin logo. Suba el logo primero.'
      });
      logger.warn('⚠️ Regeneración de QRs bloqueada: logo faltante en BD');
      return resultado;
    }

    // Determinar qué QR regenerar
    let codigos;
    if (all) {
      codigos = await prisma.codigoQr.findMany({
        include: { alumno: true, personal: true }
      });
    } else if (ids.length > 0) {
      codigos = await prisma.codigoQr.findMany({
        where: { id: { in: ids } },
        include: { alumno: true, personal: true }
      });
    } else {
      resultado.skipped = 1;
      return resultado;
    }

    logger.info({ count: codigos.length }, `🔧 Iniciando regeneración de ${codigos.length} QR(s)`);

    // Regenerar cada QR
    for (const codigo of codigos) {
      try {
        // Validar token
        const tokenData = tokenService.validarToken(codigo.token);
        if (!tokenData) {
          logger.warn({ qrId: codigo.id }, `⚠️ Token inválido para QR ${codigo.id}`);
          resultado.fallidos.push({
            id: codigo.id,
            reason: 'invalid_token',
            token: codigo.token.substring(0, 20) + '...'
          });
          continue;
        }

        // Obtener datos de persona para nombre
        let carnet;
        if (codigo.persona_tipo === 'alumno' && codigo.alumno) {
          carnet = codigo.alumno.carnet;
        } else if (codigo.persona_tipo === 'personal' && codigo.personal) {
          carnet = codigo.personal.carnet;
        } else {
          resultado.fallidos.push({
            id: codigo.id,
            reason: 'persona_not_found'
          });
          continue;
        }

        // Generar rutas
        const { relativePath, absolutePath } = qrService.obtenerRutasQr(
          codigo.persona_tipo,
          carnet
        );

        // Generar QR con logo
        const success = await qrService.generarQrConLogo(
          codigo.token,
          institucion.logo_base64,
          absolutePath
        );

        if (!success) {
          throw new Error('QR generation failed');
        }

        // Actualizar BD
        await prisma.codigoQr.update({
          where: { id: codigo.id },
          data: {
            png_path: relativePath,
            regenerado_en: new Date()
          }
        });

        resultado.regenerados.push({
          id: codigo.id,
          persona_tipo: codigo.persona_tipo,
          carnet,
          png_path: relativePath
        });

        logger.debug({ qrId: codigo.id }, `✅ QR ${codigo.id} regenerado exitosamente`);
      } catch (error) {
        logger.error({ err: error, qrId: codigo.id }, `❌ Error regenerando QR ${codigo.id}`);
        resultado.fallidos.push({
          id: codigo.id,
          reason: 'generation_error',
          error: error.message
        });
      }
    }

    // Registrar en auditoria
    if (resultado.regenerados.length > 0 || resultado.fallidos.length > 0) {
      await prisma.auditoria.create({
        data: {
          entidad: 'CodigoQr',
          usuario_id: userId,
          accion: 'regenerar',
          detalle: JSON.stringify({
            regenerados: resultado.regenerados.length,
            fallidos: resultado.fallidos.length,
            tipo: all ? 'all' : 'ids',
            ids_count: ids.length
          })
        }
      });
    }

    logger.info({
      regenerados: resultado.regenerados.length,
      fallidos: resultado.fallidos.length
    }, '🔧 Resumen de regeneración de QRs');

    return resultado;
  } catch (error) {
    logger.error({ err: error }, '❌ Error fatal durante regeneración');
    resultado.fallidos.push({
      reason: 'fatal_error',
      error: error.message
    });
    return resultado;
  }
}

/**
 * Regenerar logo desde logo_base64 en BD
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function regenerarLogo(userId = null) {
  const resultado = {
    timestamp: new Date().toISOString(),
    success: false,
    path: null
  };

  try {
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    if (!institucion || !institucion.logo_base64) {
      resultado.error = 'Logo not found in database';
      logger.warn('⚠️ Regeneración de logo: logo no está en BD');
      return resultado;
    }

    const logoResult = await qrService.guardarLogo(institucion.logo_base64, 'logo.png');
    if (!logoResult) {
      resultado.error = 'Failed to save logo file';
      return resultado;
    }

    // Actualizar ruta en BD
    await prisma.institucion.update({
      where: { id: 1 },
      data: { logo_path: logoResult.relativePath }
    });

    resultado.success = true;
    resultado.path = logoResult.absolutePath;

    // Registrar en auditoria
    await prisma.auditoria.create({
      data: {
        entidad: 'Institucion',
        entidad_id: 1,
        usuario_id: userId,
        accion: 'regenerar',
        detalle: JSON.stringify({ tipo: 'logo', path: logoResult.relativePath })
      }
    });

    logger.info('✅ Logo regenerado exitosamente');
    return resultado;
  } catch (error) {
    logger.error({ err: error }, '❌ Error regenerando logo');
    resultado.error = error.message;
    return resultado;
  }
}

/**
 * Auto-reparación ejecutada por scheduler
 * Si hay QR faltantes, intenta regenerarlos automáticamente
 */
async function autoRepair() {
  logger.info('🔧 Trabajo de auto-reparación iniciado');
  const startTime = Date.now();

  try {
    // Ejecutar diagnóstico
    const diagnosticsService = require('./diagnosticsService');
    const diag = await diagnosticsService.ejecutarDiagnosticos();

    if (diag.missing_qrs.length === 0 && !diag.missing_logo) {
      logger.info('✅ Sistema saludable, no se requieren reparaciones');
      return { healthy: true, duration: Date.now() - startTime };
    }

    // Regenerar logo si falta
    if (diag.missing_logo) {
      const logoResult = await regenerarLogo(null);
      if (logoResult.success) {
        logger.info('✅ Logo reparado');
      }
    }

    // Regenerar QR faltantes
    if (diag.missing_qrs.length > 0) {
      const idsARepara = diag.missing_qrs.map(q => q.id).slice(0, 100); // max 100 por batch
      const repairResult = await regenerarQrs({ ids: idsARepara, userId: null });
      
      logger.info({
        regenerados: repairResult.regenerados.length,
        fallidos: repairResult.fallidos.length
      }, '🔧 Lote de reparación de QR completado');
    }

    return { 
      healthy: false,
      repaired: diag.missing_qrs.length,
      duration: Date.now() - startTime
    };
  } catch (error) {
    logger.error({ err: error }, '❌ Trabajo de auto-reparación falló');
    return {
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

module.exports = {
  regenerarQrs,
  regenerarLogo,
  autoRepair
};
