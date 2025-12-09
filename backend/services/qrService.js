const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');
const { logger } = require('../utils/logger');
const { UPLOADS_DIR } = require('../utils/paths');
const cloudinaryService = require('./cloudinaryService');

/**
 * Servicio para generar QR con logo institucional
 * Ahora integrado con Cloudinary para despliegue en la nube
 */

const QRS_DIR = path.join(UPLOADS_DIR, 'qrs');
const LOGOS_DIR = path.join(UPLOADS_DIR, 'logos');

/**
 * Inicializar directorios necesarios (Mantenido para compatibilidad local/dev)
 */
async function inicializarDirectorios() {
  // En entorno cloud (Render) no necesitamos persistencia local, 
  // pero esto no hace daño si falla.
  try {
    const fs = require('fs-extra');
    await fs.ensureDir(QRS_DIR);
    await fs.ensureDir(LOGOS_DIR);
    logger.debug({ QRS_DIR, LOGOS_DIR }, '📁 Directorios de QR inicializados (Local)');
  } catch (error) {
    logger.warn({ err: error }, '⚠️ No se pudieron crear directorios locales (normal en Cloud)');
  }
}

/**
 * Generar QR con logo centrado y subir a Cloudinary
 * @param {string} token - Token a codificar en QR
 * @param {string} logoBase64 - Logo en base64
 * @param {string} filename - Nombre del archivo (ej: alumno-123.png)
 * @param {number} size - Tamaño del QR
 * @returns {Promise<string|null>} URL segura de Cloudinary o null si falla
 */
async function generarQrConLogo(token, logoBase64, filename, size = 600) {
  try {
    // Generar QR
    const qrBuffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: size,
      margin: 2
    });

    // Procesar logo base64
    const base64Data = logoBase64.includes('base64,')
      ? logoBase64.split('base64,')[1]
      : logoBase64;

    const logoBuffer = Buffer.from(base64Data, 'base64');

    // Redimensionar logo al ~18% del tamaño del QR
    const logoSize = Math.round(size * 0.18);
    const logoResized = await sharp(logoBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .png()
      .toBuffer();

    // Composición: QR + logo centrado
    const finalBuffer = await sharp(qrBuffer)
      .composite([
        {
          input: logoResized,
          gravity: 'center'
        }
      ])
      .png()
      .toBuffer();

    // Subir a Cloudinary
    // Usamos el filename como public_id (sin extensión)
    const publicId = path.parse(filename).name;
    const result = await cloudinaryService.uploadBuffer(finalBuffer, 'qrs', publicId);

    logger.debug({ url: result.secure_url }, '✅ QR generado y subido a Cloudinary');
    return result.secure_url;
  } catch (error) {
    logger.error({ err: error, filename }, '❌ Error generando QR con Cloudinary');
    return null;
  }
}

/**
 * Generar QR puro (sin logo) y subir a Cloudinary
 */
async function generarQrPuro(token, filename, size = 600) {
  try {
    const qrBuffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: size,
      margin: 2
    });

    const publicId = path.parse(filename).name;
    const result = await cloudinaryService.uploadBuffer(qrBuffer, 'qrs', publicId);

    logger.debug({ url: result.secure_url }, '✅ QR puro generado y subido a Cloudinary');
    return result.secure_url;
  } catch (error) {
    logger.error({ err: error, filename }, '❌ Error generando QR puro con Cloudinary');
    return null;
  }
}

/**
 * Generar ruta/nombre de archivo para QR
 * @param {string} personaTipo
 * @param {string} carnet
 * @returns {string} Nombre del archivo (ej: alumno-12345.png)
 */
function obtenerNombreQr(personaTipo, carnet) {
  return `${personaTipo}-${carnet.replace(/\s+/g, '_')}.png`;
}

// Mantener compatibilidad con llamadas antiguas que esperan { relativePath, absolutePath }
// AUNQUE ahora solo usaremos el filename para Cloudinary
function obtenerRutasQr(personaTipo, carnet) {
  const filename = obtenerNombreQr(personaTipo, carnet);
  const relativePath = `qrs/${filename}`;
  const absolutePath = path.join(QRS_DIR, filename);
  return { relativePath, absolutePath, filename };
}

/**
 * Guardar logo en Cloudinary
 * @param {string} logoBase64
 * @param {string} filename
 * @returns {Promise<string|null>} URL de Cloudinary
 */
async function guardarLogo(logoBase64, filename = 'logo.png') {
  try {
    const base64Data = logoBase64.includes('base64,')
      ? logoBase64.split('base64,')[1]
      : logoBase64;

    const logoBuffer = Buffer.from(base64Data, 'base64');
    
    const publicId = path.parse(filename).name;
    const result = await cloudinaryService.uploadBuffer(logoBuffer, 'logos', publicId);

    logger.debug({ url: result.secure_url }, '✅ Logo subido a Cloudinary');
    return result.secure_url;
  } catch (error) {
    logger.error({ err: error, filename }, '❌ Error guardando logo en Cloudinary');
    return null;
  }
}

/**
 * Verificar QR (Simulado para Cloudinary - siempre true si tenemos URL)
 */
async function verificarQr(url) {
  return !!url;
}

/**
 * Listar QRs (No soportado igual en Cloudinary, retornar vacío por ahora)
 */
async function listarQrs() {
  return [];
}

module.exports = {
  inicializarDirectorios,
  generarQrConLogo,
  generarQrPuro,
  obtenerRutasQr,
  guardarLogo,
  verificarQr,
  listarQrs,
  QRS_DIR,
  LOGOS_DIR,
  UPLOADS_DIR
};
