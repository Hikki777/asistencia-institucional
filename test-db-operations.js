// Test completo de operaciones de base de datos
require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseOperations() {
  try {
    console.log('🔄 Iniciando pruebas de base de datos...\n');

    // Test 1: Conexión básica
    console.log('1️⃣ Test de conexión básica...');
    await prisma.$connect();
    console.log('   ✅ Conexión establecida\n');

    // Test 2: Query simple
    console.log('2️⃣ Test de query (SELECT NOW())...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('   ✅ Query exitoso:', result[0].current_time, '\n');

    // Test 3: Contar registros en tabla Institucion
    console.log('3️⃣ Test de lectura (tabla Institucion)...');
    const institucionCount = await prisma.institucion.count();
    console.log('   ✅ Registros en Institucion:', institucionCount, '\n');

    // Test 4: Contar alumnos
    console.log('4️⃣ Test de lectura (tabla Alumnos)...');
    const alumnosCount = await prisma.alumno.count();
    console.log('   ✅ Registros en Alumnos:', alumnosCount, '\n');

    // Test 5: Contar personal
    console.log('5️⃣ Test de lectura (tabla Personal)...');
    const personalCount = await prisma.personal.count();
    console.log('   ✅ Registros en Personal:', personalCount, '\n');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ La conexión a Supabase funciona correctamente');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Código:', error.code);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testDatabaseOperations();
