const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('./backend/prismaClient');

async function generateSimpleQR(data, filename) {
  const qrPath = path.join(__dirname, 'uploads', 'qrs', filename);
  
  // Generar QR sin logo - más fácil de detectar
  await QRCode.toFile(qrPath, JSON.stringify(data), {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 800,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  console.log(`✅ QR generado: ${filename}`);
}

async function main() {
  console.log('🔄 Generando QR codes SIN LOGO para mejor detección...\n');
  
  // Obtener alumnos
  const alumnos = await prisma.alumno.findMany({
    take: 5
  });
  
  console.log(`📚 Generando ${alumnos.length} QRs de alumnos...`);
  for (const alumno of alumnos) {
    const data = {
      tipo: 'alumno',
      id: alumno.id,
      carnet: alumno.carnet
    };
    await generateSimpleQR(data, `alumno_${alumno.carnet}_simple.png`);
  }
  
  // Obtener personal
  const personal = await prisma.personal.findMany();
  
  console.log(`\n👨‍🏫 Generando ${personal.length} QRs de personal...`);
  for (const p of personal) {
    const data = {
      tipo: 'docente',
      id: p.id,
      carnet: p.carnet
    };
    await generateSimpleQR(data, `docente_${p.carnet}_simple.png`);
  }
  
  console.log('\n✅ Todos los QR codes SIN LOGO generados exitosamente!');
  console.log('📁 Ubicación: uploads/qrs/');
  
  await prisma.$disconnect();
}

main().catch(console.error);
