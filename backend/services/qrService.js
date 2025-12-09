const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const { logger } = require('../utils/logger');
const { UPLOADS_DIR } = require('../utils/paths');
const cloudinaryService = require('./cloudinaryService');
const prisma = require('../prismaClient');
const tokenService = require('./tokenService');

const QRS_DIR = path.join(UPLOADS_DIR, 'qrs');
const LOGOS_DIR = path.join(UPLOADS_DIR, 'logos');

// Función auxiliar para obtener buffer de imagen (Base64, URL o Archivo)
async function obtenerImagenBuffer(fuente) {
  if (!fuente) return null;

  try {
    // 1. Base64
    if (fuente.startsWith('data:') || fuente.length > 2000) { // Asumimos base64 largo
      const base64Data = fuente.includes('base64,') ? fuente.split('base64,')[1] : fuente;
      return Buffer.from(base64Data, 'base64');
    }
    
    // 2. URL (Cloudinary / Web)
    if (fuente.startsWith('http')) {
      const response = await axios.get(fuente, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    }

    // 3. Archivo Local
    // Asumimos que es una ruta relativa a uploads si no es absoluta
    const rutaLocal = path.isAbsolute(fuente) ? fuente : path.join(UPLOADS_DIR, fuente);
    if (await fs.pathExists(rutaLocal)) {
      return await fs.readFile(rutaLocal);
    }
    
    return null;
  } catch (error) {
    logger.error({ err: error, fuente }, 'Error obteniendo buffer de imagen');
    return null;
  }
}

/**
 * Generar QR con logo centrado y subir a Cloudinary
 */
async function generarQrConLogo(token, logoFuente, filename, size = 600) {
  try {
    // Generar QR
    const qrBuffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: size,
      margin: 2
    });

    const logoBuffer = await obtenerImagenBuffer(logoFuente);
    
    let finalBuffer = qrBuffer;

    if (logoBuffer) {
      // Redimensionar logo al ~20% del tamaño del QR
      const logoSize = Math.round(size * 0.20);
      const logoResized = await sharp(logoBuffer)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer();

      // Composición: QR + logo centrado
      finalBuffer = await sharp(qrBuffer)
        .composite([
          {
            input: logoResized,
            gravity: 'center'
          }
        ])
        .png()
        .toBuffer();
    }

    // Subir a Cloudinary
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
 * Generar QR automáticamente para una persona (Alumno/Personal)
 * Esta función es llamada desde los controladores al crear registros.
 */
async function generarQrParaPersona(tipo, id) {
  try {
    // 1. Obtener Institución y Logo
    const institucion = await prisma.institucion.findFirst();
    const logoFuente = institucion?.logo_path || institucion?.logo_base64;

    // 2. Obtener Persona
    let persona;
    if (tipo === 'alumno') {
      persona = await prisma.alumno.findUnique({ where: { id } });
    } else {
      persona = await prisma.personal.findUnique({ where: { id } });
    }

    if (!persona) throw new Error(`${tipo} no encontrado`);

    // 3. Verificar/Crear Registro CodigoQr
    let codigoQr = await prisma.codigoQr.findFirst({
        where: {
            persona_tipo: tipo,
            ...(tipo === 'alumno' ? { alumno_id: id } : { personal_id: id })
        }
    });

    if (!codigoQr) {
        const token = tokenService.generarToken(tipo, id);
        codigoQr = await prisma.codigoQr.create({
            data: {
                persona_tipo: tipo,
                token,
                vigente: true,
                ...(tipo === 'alumno' ? { alumno_id: id } : { personal_id: id })
            }
        });
    }

    // 4. Generar Imagen QR
    const filename = `${tipo}-${persona.carnet.replace(/\s+/g, '_')}.png`;
    const qrUrl = await generarQrConLogo(codigoQr.token, logoFuente, filename);

    if (qrUrl) {
        await prisma.codigoQr.update({
            where: { id: codigoQr.id },
            data: { png_path: qrUrl, generado_en: new Date() }
        });
    }

    // 5. Devolver URL
    return qrUrl;

  } catch (error) {
    logger.error({ err: error, tipo, id }, '❌ Error en generarQrParaPersona');
    return null; // No fallar la creación de persona si falla el QR
  }
}

// ... mantener funciones anteriores si es necesario ...

/**
 * Generar ruta/nombre de archivo para QR
 */
function obtenerNombreQr(personaTipo, carnet) {
  return `${personaTipo}-${carnet.replace(/\s+/g, '_')}.png`;
}

function obtenerRutasQr(personaTipo, carnet) {
  const filename = obtenerNombreQr(personaTipo, carnet);
  const relativePath = `qrs/${filename}`;
  const absolutePath = path.join(QRS_DIR, filename);
  return { relativePath, absolutePath, filename };
}

/**
 * Guardar logo institucional (Base64 -> Cloudinary)
 */
async function guardarLogo(base64Data, filename = 'logo.png') {
  try {
    const buffer = await obtenerImagenBuffer(base64Data);
    if (!buffer) throw new Error('No se pudo procesar el logo base64');

    const publicId = path.parse(filename).name;
    // Subir a carpeta 'logos'
    const result = await cloudinaryService.uploadBuffer(buffer, 'logos', publicId);
    
    logger.info({ url: result.secure_url }, '✅ Logo subido a Cloudinary');
    return result.secure_url;
  } catch (error) {
    logger.error({ err: error }, '❌ Error guardando logo');
    return null;
  }
}

module.exports = {
  generarQrConLogo,
  generarQrParaPersona,
  obtenerRutasQr,
  guardarLogo
};
