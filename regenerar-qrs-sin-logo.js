const prisma = require('./backend/prismaClient');
const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');

const QRS_DIR = path.join(__dirname, 'uploads', 'qrs');

async function generateSimpleQR(data, outputPath) {
  try {
    // Generar QR sin logo, más grande y con mejor corrección de errores
    await QRCode.toFile(outputPath, data, {
      errorCorrectionLevel: 'M', // Medium (mejor para lectura sin logo)
      type: 'png',
      width: 1000, // Más grande
      margin: 4, // Más margen
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error(`Error generando QR: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🔄 Regenerando códigos QR sin logo...\n');
  
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
      
      await generateSimpleQR(qrData, filepath);
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
      
      await generateSimpleQR(qrData, filepath);
      console.log(`  ✓ ${p.carnet}: ${p.nombres}`);
    }
    
    console.log(`\n✅ QRs regenerados sin logo en: ${QRS_DIR}`);
    console.log(`📊 Total: ${alumnos.length + personal.length} códigos QR`);
    console.log(`\n💡 Los QR ahora son más simples y fáciles de escanear`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
