const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { logger } = require('../utils/logger');

// Configuración (debe venir de variables de entorno)
// Si no están definidas, se intentará leer de process.env
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else {
  logger.warn('[WARNING] Cloudinary no configurado. Las subidas fallarán.');
}

/**
 * Subir buffer a Cloudinary
 * @param {Buffer} buffer - Archivo en memoria
 * @param {string} folder - Carpeta en Cloudinary (ej: 'alumnos')
 * @param {string} publicId - ID único (opcional)
 * @returns {Promise<Object>} Resultado de Cloudinary
 */
const uploadBuffer = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          logger.error({ err: error }, '❌ Error subiendo a Cloudinary');
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Eliminar imagen de Cloudinary
 * @param {string} publicId 
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error({ err: error, publicId }, '❌ Error eliminando de Cloudinary');
    return false;
  }
};

module.exports = {
  uploadBuffer,
  deleteImage,
  cloudinary
};
