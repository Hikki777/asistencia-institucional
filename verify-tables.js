// Verificar tablas en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...\n');
    
    // Verificar tabla personal
    try {
      const personal = await prisma.personal.findMany();
      console.log(`✅ Tabla 'personal' existe con ${personal.length} registros`);
      personal.forEach(p => console.log(`   - ${p.carnet}: ${p.nombres} ${p.apellidos} (${p.categoria})`));
    } catch (error) {
      console.log('❌ Tabla \'personal\' no existe o error:', error.message);
    }
    
    console.log('');
    
    // Verificar tabla alumnos
    try {
      const alumnos = await prisma.alumno.findMany();
      console.log(`✅ Tabla 'alumnos' existe con ${alumnos.length} registros`);
    } catch (error) {
      console.log('❌ Tabla \'alumnos\' no existe o error:', error.message);
    }
    
    console.log('');
    
    // Verificar tabla institucion
    try {
      const institucion = await prisma.institucion.findFirst();
      console.log(`✅ Tabla 'institucion' existe`);
      if (institucion) {
        console.log(`   Nombre: ${institucion.nombre}`);
        console.log(`   Inicializado: ${institucion.inicializado}`);
      }
    } catch (error) {
      console.log('❌ Tabla \'institucion\' no existe o error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
