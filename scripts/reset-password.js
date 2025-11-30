require('dotenv').config({ path: './backend/.env' });
const prisma = require('./backend/prismaClient');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const email = 'admin@test.edu';
    const newPassword = 'admin123'; // Mínimo 6 caracteres requeridos
    
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
      console.log('\n📧 Email:', email);
      console.log('🔐 Contraseña:', newPassword);
      console.log('� Rol:', user.rol);
      console.log('🆔 ID:', user.id);
    } else {
      console.log('✅ Usuario encontrado:', user.email);
      console.log('🔧 Actualizando contraseña a "admin123"...');
      
      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.usuario.update({
        where: { id: user.id },
        data: { 
          hash_pass: newHash,
          activo: true
        }
      });
      
      console.log('✅ Contraseña actualizada correctamente');
      console.log('\n📧 Email:', email);
      console.log('🔐 Nueva contraseña:', newPassword);
    }
    
    console.log('\n🎯 Ahora puedes iniciar sesión en http://localhost:5173');
    console.log('   Email: admin@test.edu');
    console.log('   Contraseña: admin123');
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
