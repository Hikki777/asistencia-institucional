const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function crearAdmin() {
  try {
    // Verificar si ya existe un usuario admin
    const existente = await prisma.usuario.findUnique({
      where: { email: 'admin@test.edu' }
    });

    if (existente) {
      console.log('⚠️  Usuario admin@test.edu ya existe');
      console.log('🔄 Actualizando contraseña...');
      
      // Actualizar contraseña a "admin123"
      const hash = await bcrypt.hash('admin123', 10);
      
      await prisma.usuario.update({
        where: { email: 'admin@test.edu' },
        data: {
          hash_pass: hash,
          activo: true
        }
      });
      
      console.log('✅ Contraseña actualizada exitosamente');
      console.log('\n📧 Email: admin@test.edu');
      console.log('🔐 Nueva contraseña: admin123');
    } else {
      console.log('📝 Creando nuevo usuario admin...');
      
      const hash = await bcrypt.hash('admin123', 10);
      
      const usuario = await prisma.usuario.create({
        data: {
          email: 'admin@test.edu',
          hash_pass: hash,
          rol: 'admin',
          activo: true
        }
      });
      
      console.log('✅ Usuario creado exitosamente');
      console.log('\n📧 Email: admin@test.edu');
      console.log('🔐 Contraseña: admin123');
      console.log('👤 Rol: admin');
      console.log('🆔 ID:', usuario.id);
    }

    console.log('\n🎯 Ahora puedes iniciar sesión en http://localhost:5173');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

crearAdmin();
