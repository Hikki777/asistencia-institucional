const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRLS() {
  try {
    const tables = [
      'alumnos', 'codigos_qr', 'personal', 'asistencias', 
      'auditoria', 'excusas', 'institucion', 'usuarios', 'diagnostic_results'
    ];

    console.log('Checking RLS status for tables...');
    
    const results = await prisma.$queryRaw`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname IN (${Prisma.join(tables)})
      AND relkind = 'r';
    `;

    console.table(results);
    
  } catch (error) {
    console.error('Error checking RLS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRLS();
