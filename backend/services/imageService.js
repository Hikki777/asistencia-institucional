const sharp = require('sharp');
const { logger } = require('../utils/logger');

/**
 * Comprimir imagen usando Sharp
 * @param {Buffer} buffer - Buffer de la imagen original
 * @param {Object} options - Opciones de compresión
 * @param {number} options.maxWidth - Ancho máximo (default: 800)
 * @param {number} options.maxHeight - Alto máximo (default: 800)
 * @param {number} options.quality - Calidad WebP 1-100 (default: 85)
 * @returns {Promise<Buffer>} Buffer de la imagen comprimida
 */
const compressImage = async (buffer, options = {}) => {
  try {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 85
    } = options;

    const compressedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toBuffer();

    const originalSize = buffer.length;
    const compressedSize = compressedBuffer.length;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    logger.info({
      originalSize: `${(originalSize / 1024).toFixed(1)}KB`,
      compressedSize: `${(compressedSize / 1024).toFixed(1)}KB`,
      reduction: `${reduction}%`
    }, '[OK] Imagen comprimida');

    return compressedBuffer;
  } catch (error) {
    logger.error({ err: error }, '❌ Error comprimiendo imagen');
    throw error;
  }
};

/**
 * Comprimir imagen para foto de perfil
 * Configuración optimizada para fotos de usuarios
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer comprimido
 */
const compressProfilePhoto = async (buffer) => {
  return compressImage(buffer, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85
  });
};

/**
 * Comprimir imagen para logo institucional
 * Mayor calidad para logos y elementos oficiales
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer comprimido
 */
const compressLogo = async (buffer) => {
  return compressImage(buffer, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 95
  });
};

/**
 * Comprimir imagen para thumbnail
 * Máxima compresión para miniaturas
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer comprimido
 */
const compressThumbnail = async (buffer) => {
  return compressImage(buffer, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 70
  });
};

module.exports = {
  compressImage,
  compressProfilePhoto,
  compressLogo,
  compressThumbnail
};
