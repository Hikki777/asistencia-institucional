const fs = require('fs-extra');
const path = require('path');
const { UPLOADS_DIR } = require('../utils/paths');
const { logger } = require('../utils/logger');

/**
 * Guardar buffer en disco local
 * @param {Buffer} buffer - Archivo en memoria
 * @param {string} folder - Carpeta destino (ej: 'alumnos')
 * @param {string} filename - Nombre (sin extensión) o ID
 * @returns {Promise<Object>} Resultado compatible con interfaz anterior
 */
const uploadBuffer = async (buffer, folder, filename) => {
  try {
    const folderPath = path.join(UPLOADS_DIR, folder);
    await fs.ensureDir(folderPath);
    
    // Asegurar extensión .png
    const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    const filepath = path.join(folderPath, finalFilename);
    const relativePath = `${folder}/${finalFilename}`;
    
    await fs.writeFile(filepath, buffer);
    logger.debug({ filepath }, '[FILE] Archivo guardado localmente');
    
    return {
      secure_url: relativePath, // Mantener compatibilidad de nombre
      public_id: filename,
      format: 'png',
      local_path: filepath
    };
  } catch (error) {
    logger.error({ err: error, folder, filename }, '[ERROR] Error guardando archivo local');
    throw error;
  }
};

/**
 * Eliminar imagen local
 */
const deleteImage = async (publicId) => {
  try {
    // Intentar buscar en todas las carpetas posibles si no se especifica
    // Esto es un fallback, idealmente deberíamos saber la carpeta
    const folders = ['alumnos', 'docentes', 'qrs', 'logos'];
    let deleted = false;
    
    for (const folder of folders) {
      const filepath = path.join(UPLOADS_DIR, folder, `${publicId}.png`);
      if (await fs.pathExists(filepath)) {
        await fs.remove(filepath);
        logger.debug({ filepath }, '[FILE] Archivo eliminado localmente');
        deleted = true;
      }
    }
    return deleted;
  } catch (error) {
    logger.error({ err: error, publicId }, '[ERROR] Error eliminando archivo local');
    return false;
  }
};

module.exports = {
  uploadBuffer,
  deleteImage
};
