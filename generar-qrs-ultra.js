const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('./backend/prismaClient');

async function generateUltraQR(data, filename) {
  const qrPath = path.join(__dirname, 'uploads', 'qrs', filename);
  
  // QR ULTRA optimizado para webcam
  await QRCode.toFile(qrPath, JSON.stringify(data), {
    errorCorrectionLevel: 'L', // Baja corrección = más datos legibles
    type: 'png',
    width: 1200, // MÁS GRANDE
    margin: 4,   // MÁS MARGEN
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    rendererOpts: {
      quality: 1.0 // Máxima calidad
    }
  });
  
  console.log(`✅ QR ULTRA generado: ${filename}`);
}

async function main() {
  console.log('🔄 Generando QR codes ULTRA para webcam...\n');
  
  // Personal más común
  const personal = await prisma.personal.findMany();
  
  console.log(`👨‍🏫 Generando ${personal.length} QRs ULTRA...`);
  for (const p of personal) {
    const data = {
      tipo: 'docente',
      id: p.id,
      carnet: p.carnet
    };
    await generateUltraQR(data, `docente_${p.carnet}_ultra.png`);
  }
  
  // Un alumno de prueba
  const alumno = await prisma.alumno.findFirst();
  if (alumno) {
    const data = {
      tipo: 'alumno',
      id: alumno.id,
      carnet: alumno.carnet
    };
    await generateUltraQR(data, `alumno_${alumno.carnet}_ultra.png`);
    console.log(`✅ QR ULTRA generado: alumno_${alumno.carnet}_ultra.png`);
  }
  
  console.log('\n✅ Todos los QR codes ULTRA generados!');
  console.log('📁 Ubicación: uploads/qrs/');
  console.log('💡 Estos QR son más grandes y con menos corrección de errores');
  console.log('💡 Deberían ser más fáciles de leer desde una pantalla');
  
  await prisma.$disconnect();
}

main().catch(console.error);
