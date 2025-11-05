const Jimp = require('jimp');
const jsQR = require('jsqr');
const path = require('path');

async function readQR(filename) {
  try {
    const qrPath = path.join(__dirname, 'uploads', 'qrs', filename);
    console.log('📂 Leyendo:', qrPath);
    
    const image = await Jimp.read(qrPath);
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('✅ QR detectado');
      console.log('📱 Contenido:', code.data);
      console.log('🔍 Parseado:', JSON.parse(code.data));
    } else {
      console.log('❌ No se pudo leer el QR');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Probar varios QR
async function testAll() {
  console.log('\n=== Probando QR de Alumno ===');
  await readQR('alumno_A001.png');
  
  console.log('\n=== Probando QR de Docente ===');
  await readQR('docente_D2026001.png');
  
  console.log('\n=== Probando QR de Personal ===');
  await readQR('docente_P001.png');
}

testAll();
