const prisma = require('../prismaClient');

/**
 * Script para popular BD con datos de prueba
 * Ejecutar: node backend/prisma/seed.js
 */

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  try {
    // Crear algunos alumnos de prueba
    const alumnos = [
      {
        carnet: 'A001',
        nombres: 'Juan',
        apellidos: 'Pérez García',
        sexo: 'M',
        grado: '6to',
        jornada: 'Matutina'
      },
      {
        carnet: 'A002',
        nombres: 'María',
        apellidos: 'López Martínez',
        sexo: 'F',
        grado: '6to',
        jornada: 'Matutina'
      },
      {
        carnet: 'A003',
        nombres: 'Carlos',
        apellidos: 'Rodríguez López',
        sexo: 'M',
        grado: '5to',
        jornada: 'Vespertina'
      },
      {
        carnet: 'A004',
        nombres: 'Ana',
        apellidos: 'Jiménez Ruiz',
        sexo: 'F',
        grado: '5to',
        jornada: 'Matutina'
      }
    ];

    console.log('📚 Creando alumnos...');
    for (const alumno of alumnos) {
      const existing = await prisma.alumno.findUnique({
        where: { carnet: alumno.carnet }
      }).catch(() => null);

      if (!existing) {
        await prisma.alumno.create({ data: alumno });
        console.log(`  ✓ ${alumno.carnet}: ${alumno.nombres}`);
      }
    }

    // Crear docentes
    const personal = [
      {
        carnet: 'D001',
        nombres: 'Roberto',
        apellidos: 'Profesional Silva',
        sexo: 'M',
        categoria: 'Docente',
        jornada: 'Matutina'
      },
      {
        carnet: 'D002',
        nombres: 'Laura',
        apellidos: 'Enseñanza González',
        sexo: 'F',
        categoria: 'Directora',
        jornada: 'Vespertina'
      }
    ];

    console.log('👨‍🏫 Creando docentes...');
    for (const p of personal) {
      const existing = await prisma.personal.findUnique({
        where: { carnet: p.carnet }
      }).catch(() => null);

      if (!existing) {
        await prisma.personal.create({ data: p });
        console.log(`  ✓ ${p.carnet}: ${p.nombres}`);
      }
    }

    console.log('\n✅ Seed completado exitosamente');
    console.log('\n📝 Instrucciones próximas:');
    console.log('  1. npm run dev          (iniciar servidor)');
    console.log('  2. npm run prisma:studio  (ver datos)');
    console.log('  3. node test.js         (ejecutar pruebas)');

  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);


