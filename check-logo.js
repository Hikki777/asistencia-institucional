const prisma = require('./backend/prismaClient');

(async () => {
  try {
    const inst = await prisma.institucion.findUnique({where: {id: 1}});
    console.log('\n📊 Datos de institución:');
    console.log('   Nombre:', inst.nombre);
    console.log('   Logo path:', inst.logo_path);
    console.log('   Logo base64:', inst.logo_base64 ? `${inst.logo_base64.substring(0, 50)}...` : 'No definido');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
