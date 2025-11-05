const prisma = require('./backend/prismaClient');
const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const QRS_DIR = path.join(__dirname, 'uploads', 'qrs');
const LOGOS_DIR = path.join(__dirname, 'uploads', 'logos');

async function generateQRWithLogo(data, outputPath) {
  try {
    // Generar QR base
    const qrBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 800,
      margin: 2
    });

    // Verificar si existe logo
    const logoFiles = await fs.readdir(LOGOS_DIR).catch(() => []);
    const logoFile = logoFiles.find(f => f.endsWith('.png') && (f.startsWith('logo_') || f === 'logo.png'));
    
    if (!logoFile) {
      console.log('⚠️ No se encontró logo, generando QR sin logo');
      // Sin logo, solo guardar QR
      await fs.writeFile(outputPath, qrBuffer);
      return;
    }

    const logoPath = path.join(LOGOS_DIR, logoFile);
    console.log(`  📷 Usando logo: ${logoFile}`);
    
    // Combinar QR con logo
    const qrImage = sharp(qrBuffer);
    const qrMetadata = await qrImage.metadata();
    
    // Logo más pequeño: 15% en lugar de 25% para mejor lectura
    const logoSize = Math.floor(qrMetadata.width * 0.15);
    const logoBuffer = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();
    
    const position = Math.floor((qrMetadata.width - logoSize) / 2);
    
    await qrImage
      .composite([{ input: logoBuffer, top: position, left: position }])
      .toFile(outputPath);
    
  } catch (error) {
    console.error(`Error generando QR: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🔄 Regenerando todos los códigos QR...\n');
  
  try {
    // Asegurar directorio
    await fs.ensureDir(QRS_DIR);
    
    // Generar QRs para alumnos
    const alumnos = await prisma.alumno.findMany();
    console.log(`📚 Generando QRs para ${alumnos.length} alumnos...`);
    
    for (const alumno of alumnos) {
      const qrData = JSON.stringify({
        tipo: 'alumno',
        id: alumno.id,
        carnet: alumno.carnet
      });
      
      const filename = `alumno_${alumno.carnet}.png`;
      const filepath = path.join(QRS_DIR, filename);
      
      await generateQRWithLogo(qrData, filepath);
      console.log(`  ✓ ${alumno.carnet}: ${alumno.nombres}`);
    }
    
    // Generar QRs para personal
    const personal = await prisma.personal.findMany();
    console.log(`\n👨‍🏫 Generando QRs para ${personal.length} personal...`);
    
    for (const p of personal) {
      const qrData = JSON.stringify({
        tipo: 'docente',
        id: p.id,
        carnet: p.carnet
      });
      
      const filename = `docente_${p.carnet}.png`;
      const filepath = path.join(QRS_DIR, filename);
      
      await generateQRWithLogo(qrData, filepath);
      console.log(`  ✓ ${p.carnet}: ${p.nombres}`);
    }
    
    console.log(`\n✅ QRs generados exitosamente en: ${QRS_DIR}`);
    console.log(`📊 Total: ${alumnos.length + personal.length} códigos QR`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
