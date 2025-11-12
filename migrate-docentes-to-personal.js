// migrate-docentes-to-personal.js
// Migra datos de la tabla 'docentes' a 'personal'

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🔄 Iniciando migración de docentes a personal...\n');

    // Verificar si hay datos en docentes (tabla antigua)
    const docentesExist = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM sqlite_master 
      WHERE type='table' AND name='docentes'
    `;

    if (docentesExist[0].count === 0) {
      console.log('✅ Tabla docentes no existe, migración no necesaria');
      return;
    }

    // Obtener datos de docentes
    const docentes = await prisma.$queryRaw`SELECT * FROM docentes`;
    console.log(`📊 Encontrados ${docentes.length} registros en docentes`);

    if (docentes.length === 0) {
      console.log('✅ No hay datos para migrar');
      return;
    }

    // Migrar cada docente a personal
    for (const docente of docentes) {
      // Verificar si ya existe en personal
      const exists = await prisma.personal.findUnique({
        where: { carnet: docente.carnet }
      });

      if (exists) {
        console.log(`⏭️  ${docente.carnet} ya existe en personal, omitiendo`);
        continue;
      }

      // Crear en personal
      await prisma.personal.create({
        data: {
          carnet: docente.carnet,
          nombres: docente.nombres,
          apellidos: docente.apellidos,
          sexo: docente.sexo,
          categoria: docente.grado || docente.categoria || 'Docente', // Migrar grado a categoria
          jornada: docente.jornada,
          estado: docente.estado,
          foto_path: docente.foto_path,
          creado_en: docente.creado_en,
          actualizado_en: docente.actualizado_en
        }
      });

      console.log(`✅ Migrado: ${docente.carnet} - ${docente.nombres} ${docente.apellidos}`);
    }

    console.log('\n✨ Migración completada exitosamente\n');

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
