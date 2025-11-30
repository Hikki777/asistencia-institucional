const admin = require('firebase-admin');
const { logger } = require('../utils/logger');
const path = require('path');

let bucket;

/**
 * Inicializar Firebase Admin
 */
function inicializarFirebase() {
  try {
    // Verificar si ya está inicializado
    if (admin.apps.length > 0) {
      bucket = admin.storage().bucket();
      return;
    }

    // Intentar cargar credenciales desde variable de entorno o archivo
    const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;
    
    if (serviceAccountPath) {
      const serviceAccount = require(path.resolve(serviceAccountPath));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      
      bucket = admin.storage().bucket();
      logger.info('🔥 Firebase inicializado correctamente');
    } else {
      logger.warn('⚠️ No se configuró FIREBASE_CREDENTIALS_PATH. Backups en nube deshabilitados.');
    }
  } catch (error) {
    logger.error({ err: error }, '❌ Error inicializando Firebase');
  }
}

/**
 * Subir archivo a Firebase Storage
 * @param {string} filePath - Ruta absoluta del archivo local
 * @param {string} destination - Ruta destino en el bucket
 * @returns {Promise<string>} URL firmada o null
 */
async function uploadFile(filePath, destination) {
  if (!bucket) {
    inicializarFirebase();
    if (!bucket) return null;
  }

  try {
    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });

    logger.info({ destination }, '✅ Archivo subido a Firebase');
    
    // Generar URL firmada por 1 hora (solo para verificar, no se guarda)
    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 // 1 hora
    });

    return url;
  } catch (error) {
    logger.error({ err: error, filePath }, '❌ Error subiendo a Firebase');
    throw error;
  }
}

module.exports = {
  inicializarFirebase,
  uploadFile
};
