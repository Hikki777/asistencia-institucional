require('dotenv').config();
const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const email = 'admin@test.edu';
    const newPassword = 'admin123';
    
    // Intentar encontrar el usuario
    let user = await prisma.usuario.findUnique({ where: { email } });
    
    if (!user) {
      console.log('⚠️  Usuario no encontrado. Creando nuevo usuario admin...');
      
      const hash = await bcrypt.hash(newPassword, 10);
      user = await prisma.usuario.create({
        data: {
          email,
          hash_pass: hash,
          rol: 'admin',
          activo: true
        }
      });
      
      console.log('✅ Usuario creado exitosamente');
    } else {
      console.log('✅ Usuario encontrado:', user.email);
      console.log('🔧 Actualizando contraseña...');
      
      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.usuario.update({
        where: { id: user.id },
        data: { 
          hash_pass: newHash,
          activo: true
        }
      });
      
      console.log('✅ Contraseña actualizada correctamente');
    }
    
    console.log('\n🎯 Credenciales de acceso:');
    console.log('   📧 Email: admin@test.edu');
    console.log('   🔐 Contraseña: admin123');
    console.log('\n🌐 Inicia sesión en: http://localhost:5173');
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
