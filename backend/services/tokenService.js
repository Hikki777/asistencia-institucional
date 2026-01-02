const crypto = require('crypto');
const { logger } = require('../utils/logger');

/**
 * Servicio para generar y validar tokens HMAC para QR
 * Token format: {uuid}:{personaTipo}:{personaId}:{ts}.{signature}
 * Codificado en base64url
 */

const HMAC_SECRET = process.env.HMAC_SECRET || 'default_secret_change_in_production';

/**
 * Generar token seguro para QR
 * @param {string} personaTipo - "alumno" o "personal"
 * @param {number} personaId - ID de la persona
 * @returns {string} Token en base64url
 */
function generarToken(personaTipo, personaId) {
  const uuid = crypto.randomUUID();
  const ts = Date.now();
  const payload = `${uuid}:${personaTipo}:${personaId}:${ts}`;
  
  const signature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex');
  
  const fullToken = `${payload}.${signature}`;
  return Buffer.from(fullToken).toString('base64url');
}

/**
 * Validar token y extraer datos
 * @param {string} tokenB64 - Token en base64url
 * @returns {Object|null} { uuid, personaTipo, personaId, ts } o null si es inválido
 */
function validarToken(tokenB64) {
  try {
    const raw = Buffer.from(tokenB64, 'base64url').toString('utf8');
    const [payload, signature] = raw.split('.');
    
    if (!payload || !signature) return null;
    
    const expected = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(payload)
      .digest('hex');
    
    if (expected !== signature) {
      logger.warn({ tokenPreview: tokenB64.substring(0, 20) }, '[WARNING] Firma de token inválida');
      return null;
    }
    
    const [uuid, personaTipo, personaId, ts] = payload.split(':');
    return {
      uuid,
      personaTipo,
      personaId: parseInt(personaId, 10),
      ts: parseInt(ts, 10),
      valido: true
    };
  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error validando token');
    return null;
  }
}

/**
 * Decodificar token sin validación (solo extrae datos)
 * Útil para diagnóstico sin validar firma
 */
function decodificarToken(tokenB64) {
  try {
    const raw = Buffer.from(tokenB64, 'base64url').toString('utf8');
    const [payload] = raw.split('.');
    const [uuid, personaTipo, personaId, ts] = payload.split(':');
    return {
      uuid,
      personaTipo,
      personaId: parseInt(personaId, 10),
      ts: parseInt(ts, 10)
    };
  } catch (error) {
    logger.error({ err: error }, '[ERROR] Error decodificando token');
    return null;
  }
}

module.exports = {
  generarToken,
  validarToken,
  decodificarToken
};
