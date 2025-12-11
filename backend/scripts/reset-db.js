const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('[RESET] Iniciando limpieza de base de datos...');
  console.log('URL (masked):', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : 'UNDEFINED');
  
  const count = await prisma.institucion.count();
  console.log(`Found ${count} institutions to delete.`);

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

    console.log('[OK] Base de datos limpiada exitosamente.');
    console.log('   Todas las tablas han sido vaciadas.');
  } catch (error) {
    console.error('[ERROR] Error al limpiar la base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
