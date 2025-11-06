const fs = require('fs-extra');
const path = require('path');
const prisma = require('../prismaClient');
const { logger } = require('../utils/logger');

/**
 * Servicio de diagnóstico para detectar QR faltantes, corruptos o logo inválido
 */

/**
 * Ejecutar diagnóstico completo
 * @returns {Promise<Object>} { missing_qrs, corrupt_qrs, missing_logo, total_qrs }
 */
async function ejecutarDiagnosticos() {
  const resultado = {
    timestamp: new Date().toISOString(),
    missing_qrs: [],
    corrupt_qrs: [],
    missing_logo: false,
    total_qrs: 0,
    errors: []
  };

  try {
    // 1. Verificar logo institucional
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    if (!institucion) {
      resultado.errors.push('Institución no inicializada');
      return resultado;
    }

    if (!institucion.logo_base64) {
      resultado.missing_logo = true;
      logger.warn('⚠️ Logo no encontrado en base de datos');
    }

    // 2. Verificar cada QR
    const codigos = await prisma.codigoQr.findMany({
      include: {
        alumno: true,
        personal: true
      }
    });

    resultado.total_qrs = codigos.length;

    for (const codigo of codigos) {
      if (!codigo.png_path) {
        resultado.missing_qrs.push({
          id: codigo.id,
          persona_tipo: codigo.persona_tipo,
          persona_id: codigo.persona_tipo === 'alumno' ? codigo.alumno_id : codigo.personal_id,
          carnet: codigo.persona_tipo === 'alumno' ? codigo.alumno?.carnet : codigo.personal?.carnet,
          token: codigo.token.substring(0, 20) + '...',
          reason: 'no_path_in_db'
        });
        continue;
      }

      // Verificar que archivo existe
      const absolutePath = path.join(__dirname, '../..', 'uploads', codigo.png_path);
      const exists = await fs.pathExists(absolutePath);

      if (!exists) {
        resultado.missing_qrs.push({
          id: codigo.id,
          persona_tipo: codigo.persona_tipo,
          persona_id: codigo.persona_tipo === 'alumno' ? codigo.alumno_id : codigo.personal_id,
          carnet: codigo.persona_tipo === 'alumno' ? codigo.alumno?.carnet : codigo.personal?.carnet,
          png_path: codigo.png_path,
          token: codigo.token.substring(0, 20) + '...',
          reason: 'file_not_found'
        });
        continue;
      }

      // Verificar tamaño mínimo (corrupto)
      try {
        const stats = await fs.stat(absolutePath);
        if (stats.size < 1024) { // menos de 1KB es sospechoso
          resultado.corrupt_qrs.push({
            id: codigo.id,
            persona_tipo: codigo.persona_tipo,
            carnet: codigo.persona_tipo === 'alumno' ? codigo.alumno?.carnet : codigo.personal?.carnet,
            png_path: codigo.png_path,
            size: stats.size,
            reason: 'file_too_small'
          });
        }
      } catch (err) {
        resultado.corrupt_qrs.push({
          id: codigo.id,
          carnet: codigo.persona_tipo === 'alumno' ? codigo.alumno?.carnet : codigo.personal?.carnet,
          png_path: codigo.png_path,
          reason: 'stat_error',
          error: err.message
        });
      }
    }

    logger.info({
      total: resultado.total_qrs,
      missing: resultado.missing_qrs.length,
      corrupt: resultado.corrupt_qrs.length,
      missing_logo: resultado.missing_logo
    }, '🔍 Diagnóstico completado');

    return resultado;
  } catch (error) {
    logger.error({ err: error }, '❌ Error ejecutando diagnóstico');
    resultado.errors.push(error.message);
    return resultado;
  }
}

/**
 * Registrar resultado de diagnóstico en tabla auditoria
 */
async function registrarDiagnostico(userId, diagnosticoData) {
  try {
    await prisma.auditoria.create({
      data: {
        entidad: 'DiagnosticResult',
        usuario_id: userId,
        accion: 'diagnostico',
        detalle: JSON.stringify(diagnosticoData)
      }
    });
  } catch (error) {
    logger.error({ err: error, userId }, '❌ Error registrando diagnóstico en auditoría');
  }
}

/**
 * Obtener historial de diagnósticos de auditoria
 */
async function obtenerHistorial(limit = 10) {
  try {
    return await prisma.auditoria.findMany({
      where: { accion: 'diagnostico' },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  } catch (error) {
    logger.error({ err: error, limit }, '❌ Error obteniendo historial de diagnósticos');
    return [];
  }
}

module.exports = {
  ejecutarDiagnosticos,
  registrarDiagnostico,
  obtenerHistorial
};
