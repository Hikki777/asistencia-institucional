const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const archiver = require('archiver');
const extract = require('extract-zip');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');
const logger = require('../utils/logger');

// Configurar multer para subir archivos de backup
const upload = multer({ 
  dest: path.join(__dirname, '../temp/'),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

// Crear directorio temp si no existe
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * POST /api/backup/create
 * Crear backup cifrado del sistema completo
 * Requiere: rol admin
 */
router.post('/create', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden crear backups' });
  }

  try {
    const { password, confirmPassword } = req.body;
    
    // Validar contraseña
    if (!password || password.length < 8) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden' 
      });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const tempZipPath = path.join(tempDir, `backup-${timestamp}.zip`);
    
    logger.info({ user: req.user.email }, 'Iniciando creación de backup');
    
    // 1. Crear ZIP con base de datos y uploads
    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Agregar base de datos
    const dbPath = path.join(__dirname, '../prisma/dev.db');
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'dev.db' });
    } else {
      throw new Error('Base de datos no encontrada');
    }
    
    // Agregar carpeta uploads completa
    const uploadsPath = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }
    
    // Agregar metadata
    const institucion = await prisma.institucion.findFirst({
      select: { nombre: true, email: true, telefono: true }
    });
    
    const metadata = {
      fecha: new Date().toISOString(),
      version: '1.0.0',
      usuario: req.user.email,
      institucion: institucion,
      security: {
        algorithm: 'AES-256',
        hashAlgorithm: 'SHA-256',
        hmacAlgorithm: 'HMAC-SHA256'
      }
    };
    
    archive.append(JSON.stringify(metadata, null, 2), { 
      name: 'backup-info.json' 
    });
    
    await archive.finalize();
    
    // Esperar a que termine de escribir
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });
    
    // 2. Leer ZIP
    const zipData = fs.readFileSync(tempZipPath);
    const zipBase64 = zipData.toString('base64');
    
    // 3. Calcular hash SHA-256 del ZIP original
    const hash = crypto
      .createHash('sha256')
      .update(zipData)
      .digest('hex');
    
    // 4. Crear HMAC para autenticidad
    const hmac = crypto
      .createHmac('sha256', process.env.HMAC_SECRET || 'default-secret')
      .update(zipData)
      .digest('hex');
    
    // 5. Cifrar con AES-256
    const encrypted = CryptoJS.AES.encrypt(zipBase64, password).toString();
    
    // 6. Crear estructura final
    const backupData = {
      version: '1.0',
      encrypted: encrypted,
      hash: hash,
      hmac: hmac,
      timestamp: new Date().toISOString(),
      size: zipData.length,
      metadata: {
        institucion: institucion?.nombre,
        fecha: metadata.fecha
      }
    };
    
    const finalBackup = JSON.stringify(backupData);
    
    // 7. Enviar archivo
    const backupName = `sistema-backup-${timestamp}.bak`;
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${backupName}"`);
    res.send(finalBackup);
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempZipPath);
    
    logger.info({ 
      user: req.user.email,
      filename: backupName,
      size: finalBackup.length,
      hash: hash.substring(0, 16) + '...'
    }, 'Backup creado exitosamente');
    
  } catch (error) {
    logger.error({ error: error.message }, 'Error creando backup');
    res.status(500).json({ error: 'Error al crear backup: ' + error.message });
  }
});

/**
 * POST /api/backup/restore
 * Restaurar sistema desde backup cifrado
 * Requiere: rol admin
 */
router.post('/restore', authMiddleware, upload.single('backup'), async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden restaurar backups' });
  }

  const backupFile = req.file?.path;
  let extractPath;
  let tempZipPath;

  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Se requiere contraseña' });
    }
    
    if (!backupFile) {
      return res.status(400).json({ error: 'No se recibió archivo de backup' });
    }
    
    logger.info({ user: req.user.email }, 'Iniciando restauración de backup');
    
    // 1. Leer archivo de backup
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    let backupData;
    
    try {
      backupData = JSON.parse(backupContent);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Archivo de backup inválido o corrupto' 
      });
    }
    
    // 2. Validar estructura
    if (!backupData.encrypted || !backupData.hash || !backupData.hmac) {
      return res.status(400).json({ 
        error: 'Archivo de backup incompleto' 
      });
    }
    
    // 3. Descifrar
    let decrypted;
    try {
      const bytes = CryptoJS.AES.decrypt(backupData.encrypted, password);
      decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Contraseña incorrecta');
      }
    } catch (error) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta' 
      });
    }
    
    // 4. Convertir de Base64 a Buffer
    const zipBuffer = Buffer.from(decrypted, 'base64');
    
    // 5. VALIDAR HASH - Verificar integridad
    const calculatedHash = crypto
      .createHash('sha256')
      .update(zipBuffer)
      .digest('hex');
    
    if (calculatedHash !== backupData.hash) {
      logger.error({ 
        expected: backupData.hash,
        calculated: calculatedHash 
      }, 'Hash mismatch - archivo corrupto');
      
      return res.status(400).json({ 
        error: 'Archivo corrupto o modificado. Hash no coincide.' 
      });
    }
    
    // 6. VALIDAR HMAC - Verificar autenticidad
    const calculatedHmac = crypto
      .createHmac('sha256', process.env.HMAC_SECRET || 'default-secret')
      .update(zipBuffer)
      .digest('hex');
    
    if (calculatedHmac !== backupData.hmac) {
      logger.error('HMAC mismatch - archivo no auténtico');
      
      return res.status(400).json({ 
        error: 'Archivo no auténtico. HMAC no coincide.' 
      });
    }
    
    logger.info('Hash y HMAC validados correctamente');
    
    // 7. Guardar ZIP temporal
    tempZipPath = path.join(tempDir, `restore-${Date.now()}.zip`);
    fs.writeFileSync(tempZipPath, zipBuffer);
    
    // 8. Extraer ZIP
    extractPath = path.join(tempDir, `restore-data-${Date.now()}`);
    
    await extract(tempZipPath, { dir: path.resolve(extractPath) });
    
    // 9. Validar metadata
    const metadataPath = path.join(extractPath, 'backup-info.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Metadata no encontrada en el backup');
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // 10. Restaurar base de datos
    const restoredDbPath = path.join(extractPath, 'dev.db');
    const targetDbPath = path.join(__dirname, '../prisma/dev.db');
    
    if (!fs.existsSync(restoredDbPath)) {
      throw new Error('Base de datos no encontrada en el backup');
    }
    
    fs.copyFileSync(restoredDbPath, targetDbPath);
    logger.info('Base de datos restaurada');
    
    // 11. Restaurar uploads
    const restoredUploadsPath = path.join(extractPath, 'uploads');
    const targetUploadsPath = path.join(__dirname, '../uploads');
    
    if (fs.existsSync(targetUploadsPath)) {
      fs.rmSync(targetUploadsPath, { recursive: true, force: true });
    }
    
    if (fs.existsSync(restoredUploadsPath)) {
      fs.cpSync(restoredUploadsPath, targetUploadsPath, { recursive: true });
      logger.info('Archivos multimedia restaurados');
    }
    
    // 12. Limpiar archivos temporales
    fs.unlinkSync(tempZipPath);
    fs.unlinkSync(backupFile);
    fs.rmSync(extractPath, { recursive: true, force: true });
    
    res.json({ 
      success: true, 
      message: 'Sistema restaurado correctamente',
      metadata,
      validation: {
        hashVerified: true,
        hmacVerified: true,
        size: backupData.size,
        backupDate: backupData.timestamp
      }
    });
    
    logger.info({ 
      user: req.user.email,
      backupDate: metadata.fecha,
      hash: calculatedHash.substring(0, 16) + '...'
    }, 'Backup restaurado exitosamente');
    
    // Reiniciar servidor después de 2 segundos
    setTimeout(() => {
      logger.info('Reiniciando servidor después de restauración');
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    // Limpiar archivos temporales en caso de error
    try {
      if (backupFile && fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }
      if (tempZipPath && fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }
      if (extractPath && fs.existsSync(extractPath)) {
        fs.rmSync(extractPath, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      logger.error({ error: cleanupError }, 'Error limpiando archivos temporales');
    }
    
    logger.error({ error: error.message }, 'Error restaurando backup');
    res.status(500).json({ 
      error: error.message || 'Error al restaurar backup' 
    });
  }
});

module.exports = router;
