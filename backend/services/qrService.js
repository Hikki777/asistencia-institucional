const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { logger } = require('../utils/logger');

/**
 * Servicio para generar QR con logo institucional
 */

const UPLOADS_DIR = path.join(__dirname, '../..', 'uploads');
const QRS_DIR = path.join(UPLOADS_DIR, 'qrs');
const LOGOS_DIR = path.join(UPLOADS_DIR, 'logos');

/**
 * Inicializar directorios necesarios
 */
async function inicializarDirectorios() {
  try {
    await fs.ensureDir(QRS_DIR);
    await fs.ensureDir(LOGOS_DIR);
    logger.debug({ QRS_DIR, LOGOS_DIR }, '📁 Directorios de QR inicializados');
  } catch (error) {
    logger.error({ err: error }, '❌ Error inicializando directorios de QR');
  }
}

/**
 * Generar QR con logo centrado
 * @param {string} token - Token a codificar en QR
 * @param {string} logoBase64 - Logo en base64 (con o sin prefijo data:image)
 * @param {string} outPath - Ruta absoluta donde guardar PNG
 * @param {number} size - Tamaño del QR (default 600x600)
 * @returns {Promise<boolean>} true si se generó exitosamente
 */
async function generarQrConLogo(token, logoBase64, outPath, size = 600) {
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
    const tmpPath = outPath + '.tmp';
    await sharp(qrBuffer)
      .composite([
        {
          input: logoResized,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(tmpPath);

    // Mover archivo temporal al destino (transactional)
    await fs.move(tmpPath, outPath, { overwrite: true });

    logger.debug({ outPath }, '✅ QR generado exitosamente');
    return true;
  } catch (error) {
    logger.error({ err: error, outPath }, '❌ Error generando QR');
    // Limpiar archivo temporal si existe
    const tmpPath = outPath + '.tmp';
    await fs.remove(tmpPath).catch(() => {});
    return false;
  }
}

/**
 * Generar QR puro (sin logo)
 * @param {string} token
 * @param {string} outPath
 * @param {number} size
 */
async function generarQrPuro(token, outPath, size = 600) {
  try {
    const qrBuffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: size,
      margin: 2
    });

    const tmpPath = outPath + '.tmp';
    await fs.writeFile(tmpPath, qrBuffer);
    await fs.move(tmpPath, outPath, { overwrite: true });

    logger.debug({ outPath }, '✅ QR puro generado');
    return true;
  } catch (error) {
    logger.error({ err: error, outPath }, '❌ Error generando QR puro');
    await fs.remove(outPath + '.tmp').catch(() => {});
    return false;
  }
}

/**
 * Generar ruta de almacenamiento para QR
 * @param {string} personaTipo - "alumno" o "personal"
 * @param {string} carnet - Carnet de la persona
 * @returns {string} Ruta relativa (para BD) y ruta absoluta
 */
function obtenerRutasQr(personaTipo, carnet) {
  const filename = `${personaTipo}-${carnet.replace(/\s+/g, '_')}.png`;
  const relativePath = `qrs/${filename}`;
  const absolutePath = path.join(QRS_DIR, filename);
  return { relativePath, absolutePath };
}

/**
 * Guardar logo desde base64 a archivo
 * @param {string} logoBase64
 * @param {string} filename - Ej: "logo.png"
 * @returns {Promise<{relativePath, absolutePath}|null>}
 */
async function guardarLogo(logoBase64, filename = 'logo.png') {
  try {
    const base64Data = logoBase64.includes('base64,')
      ? logoBase64.split('base64,')[1]
      : logoBase64;

    const absolutePath = path.join(LOGOS_DIR, filename);
    const relativePath = `logos/${filename}`;

    const logoBuffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(absolutePath, logoBuffer);

    logger.debug({ absolutePath, relativePath }, '✅ Logo guardado');
    return { relativePath, absolutePath };
  } catch (error) {
    logger.error({ err: error, filename }, '❌ Error guardando logo');
    return null;
  }
}

/**
 * Verificar si archivo PNG existe y tiene tamaño válido
 * @param {string} absolutePath
 * @param {number} minSize - Tamaño mínimo en bytes (default 1KB)
 * @returns {Promise<boolean>}
 */
async function verificarQr(absolutePath, minSize = 1024) {
  try {
    const stats = await fs.stat(absolutePath);
    return stats.size >= minSize && stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Listar todos los QR generados
 * @returns {Promise<Array>}
 */
async function listarQrs() {
  try {
    const files = await fs.readdir(QRS_DIR);
    return files.map(f => ({
      filename: f,
      path: `qrs/${f}`,
      absolutePath: path.join(QRS_DIR, f)
    }));
  } catch (error) {
    logger.error({ err: error }, '❌ Error listando QRs');
    return [];
  }
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
