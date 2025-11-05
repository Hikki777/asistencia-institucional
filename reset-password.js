const prisma = require('./backend/prismaClient');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const email = 'admin@test.edu';
    const plainPassword = 'admin';
    
    const user = await prisma.usuario.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      await prisma.$disconnect();
      return;
    }
    
    console.log('Usuario encontrado:', user.email);
    console.log('Hash almacenado:', user.hash_pass.substring(0, 20) + '...');
    
    const match = await bcrypt.compare(plainPassword, user.hash_pass);
    console.log(`\n🔐 Comparación de contraseña: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    if (!match) {
      console.log('\n🔧 Regenerando hash para "admin"...');
      const newHash = await bcrypt.hash('admin', 10);
      await prisma.usuario.update({
        where: { id: user.id },
        data: { hash_pass: newHash }
      });
      console.log('✅ Hash actualizado correctamente');
    }
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
