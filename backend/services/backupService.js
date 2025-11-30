const archiver = require('archiver');
const fs = require('fs-extra');
const path = require('path');
const prisma = require('../prismaClient');
const { logger } = require('../utils/logger');
const { BACKUPS_DIR } = require('../utils/paths');
const { uploadFile } = require('./firebaseService');

/**
 * Servicio de backup comprimido
 * Crea ZIP con BD + /uploads
 */

// const BACKUPS_DIR = path.join(__dirname, '../..', 'backups'); // REMOVED

let backupsInitialized = false;

/**
 * Inicializar directorio de backups
 */
async function inicializarBackups() {
  if (backupsInitialized) return;
  
  try {
    await fs.ensureDir(BACKUPS_DIR);
    backupsInitialized = true;
    logger.debug({ BACKUPS_DIR }, '📁 Directorio de backups inicializado');
  } catch (error) {
    logger.error({ err: error }, '❌ Error inicializando directorio de backups');
  }
}

// NO ejecutar aquí - dejar que lo llame server.js cuando sea el momento correcto

/**
 * Crear backup completo
 * @param {number} userId - ID del usuario que solicita el backup
 * @returns {Promise<Object>}
 */
async function crearBackup(userId = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupName = `backup-${timestamp}-${Date.now()}.zip`;
  const backupPath = path.join(BACKUPS_DIR, backupName);

  const resultado = {
    timestamp: new Date().toISOString(),
    backup_name: backupName,
    backup_path: backupPath,
    size_bytes: 0,
    success: false,
    files_count: 0
  };

  try {
    logger.info({ backupName }, '💾 Iniciando backup');

    // Crear stream de escritura
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', async () => {
        const stats = await fs.stat(backupPath);
        resultado.success = true;
        resultado.size_bytes = stats.size;

        // Registrar en auditoria
        if (userId) {
          await prisma.auditoria.create({
            data: {
              entidad: 'Backup',
              usuario_id: userId,
              accion: 'backup',
              detalle: JSON.stringify({
                backup_name: backupName,
                size: stats.size
              })
            }
          });
        }

        logger.info({ backupName, sizeMB: (stats.size / 1024 / 1024).toFixed(2) }, '✅ Backup completado');
        resolve(resultado);
      });

      archive.on('error', (err) => {
        logger.error({ err, backupName }, '❌ Error en archivo de backup');
        resultado.error = err.message;
        reject(err);
      });

      archive.pipe(output);

      // Agregar BD
      const dbPath = path.join(__dirname, '../prisma/dev.db');
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'database/dev.db' });
        resultado.files_count++;
      }

      // Agregar uploads
      const uploadsDir = path.join(__dirname, '../..', 'uploads');
      if (fs.existsSync(uploadsDir)) {
        archive.directory(uploadsDir, 'uploads');
        resultado.files_count++;
      }

      archive.finalize();
    });
  } catch (error) {
    logger.error({ err: error }, '❌ Error creando backup');
    resultado.error = error.message;
    return resultado;
  }
}

/**
 * Listar backups existentes
 * @returns {Promise<Array>}
 */
async function listarBackups() {
  try {
    const files = await fs.readdir(BACKUPS_DIR);
    const backups = [];

    for (const file of files.filter(f => f.endsWith('.zip'))) {
      const filePath = path.join(BACKUPS_DIR, file);
      const stats = await fs.stat(filePath);
      backups.push({
        name: file,
        path: filePath,
        size: stats.size,
        size_mb: (stats.size / 1024 / 1024).toFixed(2),
        created: stats.mtime,
        mtime: stats.mtimeMs
      });
    }

    return backups.sort((a, b) => b.mtime - a.mtime);
  } catch (error) {
    logger.error({ err: error }, '❌ Error listando backups');
    return [];
  }
}

/**
 * Descargar backup
 * @param {string} backupName
 * @returns {Promise<{path, size}|null>}
 */
async function descargarBackup(backupName) {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupName);
    
    // Validar que está en el directorio de backups
    if (!backupPath.startsWith(BACKUPS_DIR)) {
      logger.warn({ backupPath }, '⚠️ Ruta de backup inválida');
      return null;
    }

    const exists = await fs.pathExists(backupPath);
    if (!exists) {
      logger.warn({ backupName }, '⚠️ Backup no encontrado');
      return null;
    }

    const stats = await fs.stat(backupPath);
    return {
      path: backupPath,
      size: stats.size,
      name: backupName
    };
  } catch (error) {
    logger.error({ err: error, backupName }, '❌ Error descargando backup');
    return null;
  }
}

/**
 * Eliminar backup viejo (antes de X días)
 * @param {number} daysOld - Eliminar backups más viejos que esto
 * @returns {Promise<number>} Cantidad eliminada
 */
async function limpiarBackupsViejos(daysOld = 30) {
  try {
    const files = await fs.readdir(BACKUPS_DIR);
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const file of files.filter(f => f.endsWith('.zip'))) {
      const filePath = path.join(BACKUPS_DIR, file);
      const stats = await fs.stat(filePath);

      if (stats.mtimeMs < cutoffTime) {
        await fs.remove(filePath);
        deleted++;
        logger.debug({ file }, '🗑️ Backup antiguo eliminado');
      }
    }

    return deleted;
  } catch (error) {
    logger.error({ err: error, daysOld }, '❌ Error limpiando backups antiguos');
    return 0;
  }
}

/**
 * Subir backup a la nube (Firebase)
 * @param {string} backupName
 * @returns {Promise<string|null>} URL firmada o null
 */
async function subirBackupNube(backupName) {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupName);
    
    // Validar existencia
    if (!await fs.pathExists(backupPath)) {
      throw new Error('Archivo de backup no encontrado');
    }

    logger.info({ backupName }, '☁️ Iniciando subida a nube...');
    const url = await uploadFile(backupPath, `backups/${backupName}`);
    
    return url;
  } catch (error) {
    logger.error({ err: error, backupName }, '❌ Error subiendo backup a nube');
    throw error;
  }
}

module.exports = {
  inicializarBackups,
  crearBackup,
  listarBackups,
  descargarBackup,
  limpiarBackupsViejos,
  subirBackupNube,
  BACKUPS_DIR
};
