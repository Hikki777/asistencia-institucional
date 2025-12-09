const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Iniciando limpieza de base de datos...');

  try {
    // Orden importante para respetar foreign keys
    const deleteOperations = [
      prisma.diagnosticResult.deleteMany(),
      prisma.auditoria.deleteMany(),
      prisma.excusa.deleteMany(),
      prisma.asistencia.deleteMany(),
      prisma.codigoQr.deleteMany(),
      prisma.alumno.deleteMany(),
      prisma.personal.deleteMany(),
      prisma.usuario.deleteMany(),
      prisma.institucion.deleteMany(),
    ];

    await prisma.$transaction(deleteOperations);

    console.log('✅ Base de datos limpiada exitosamente.');
    console.log('   Todas las tablas han sido vaciadas.');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
