const prisma = require('./backend/prismaClient');

(async () => {
  try {
    const user = await prisma.usuario.findFirst();
    if (user) {
      console.log('✅ Usuario encontrado en BD:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Rol:', user.rol);
      console.log('   Activo:', user.activo);
      console.log('   Creado:', user.creado_en);
    } else {
      console.log('❌ No hay usuarios en la BD');
    }
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
