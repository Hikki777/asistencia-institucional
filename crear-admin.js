#!/usr/bin/env node
/**
 * Script para crear o actualizar usuario administrador
 * Sistema de Registro Institucional
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function crearAdmin() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  👤 Crear/Actualizar Usuario Administrador                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    // Pedir email (con default)
    const email = await question('📧 Email (admin@test.edu): ') || 'admin@test.edu';
    
    // Pedir contraseña (con default)
    const password = await question('🔐 Contraseña (admin123): ') || 'admin123';
    
    // Verificar si ya existe
    const existente = await prisma.usuario.findUnique({
      where: { email }
    });

    const hash = await bcrypt.hash(password, 10);

    if (existente) {
      console.log(`\n⚠️  Usuario ${email} ya existe`);
      const actualizar = await question('¿Actualizar contraseña? (S/n): ') || 'S';
      
      if (actualizar.toUpperCase() === 'S') {
        await prisma.usuario.update({
          where: { email },
          data: {
            hash_pass: hash,
            activo: true
          }
        });
        
        console.log('\n✅ Contraseña actualizada exitosamente');
      } else {
        console.log('\n❌ Operación cancelada');
      }
    } else {
      console.log(`\n📝 Creando usuario ${email}...`);
      
      const usuario = await prisma.usuario.create({
        data: {
          email,
          hash_pass: hash,
          rol: 'admin',
          activo: true
        }
      });
      
      console.log('✅ Usuario creado exitosamente');
      console.log(`🆔 ID: ${usuario.id}`);
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  🎯 Credenciales de Acceso                                   ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  📧 Email:      ${email.padEnd(43)}║`);
    console.log(`║  🔐 Contraseña: ${password.padEnd(43)}║`);
    console.log(`║  👤 Rol:        admin${' '.repeat(38)}║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  🌐 Inicia sesión en: http://localhost:5173                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

crearAdmin();
