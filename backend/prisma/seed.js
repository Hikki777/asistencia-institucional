const prisma = require('../prismaClient');
const qrService = require('../services/qrService');
const tokenService = require('../services/tokenService');

/**
 * Script para popular BD con datos de prueba
 * Ejecutar: node backend/prisma/seed.js
 */

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  try {
    // Inicializar directorios
    await qrService.inicializarDirectorios();

    // Institución con logo base64 pequeño (1x1 PNG transparente)
    const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

    const institucion = await prisma.institucion.upsert({
      where: { id: 1 },
      update: {
        nombre: 'Instituto de Prueba',
        horario_inicio: '07:00',
        margen_puntualidad_min: 5,
        inicializado: true,
        logo_base64: LOGO_BASE64
      },
      create: {
        id: 1,
        nombre: 'Instituto de Prueba',
        horario_inicio: '07:00',
        margen_puntualidad_min: 5,
        inicializado: true,
        logo_base64: LOGO_BASE64
      }
    });

    // Guardar logo físico y actualizar path
    const savedLogo = await qrService.guardarLogo(institucion.logo_base64, 'logo.png');
    if (savedLogo) {
      await prisma.institucion.update({
        where: { id: 1 },
        data: { logo_path: savedLogo.relativePath }
      });
      console.log('🏫 Logo institucional configurado');
    }
    // Crear algunos alumnos de prueba
    const alumnos = [
      {
        carnet: 'A001',
        nombres: 'Juan',
        apellidos: 'Pérez García',
        sexo: 'M',
        grado: '6to',
        especialidad: 'Computación',
        jornada: 'Matutina'
      },
      {
        carnet: 'A002',
        nombres: 'María',
        apellidos: 'López Martínez',
        sexo: 'F',
        grado: '6to',
        especialidad: 'Salud',
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
        const created = await prisma.alumno.create({ data: alumno });
        console.log(`  ✓ ${alumno.carnet}: ${alumno.nombres}`);

        // Generar QR para alumno
        const token = tokenService.generarToken('alumno', created.id);
        const qr = await prisma.codigoQr.create({
          data: {
            persona_tipo: 'alumno',
            alumno_id: created.id,
            token,
            vigente: true
          }
        });
        const { relativePath, absolutePath } = qrService.obtenerRutasQr('alumno', created.carnet);
        const ok = await qrService.generarQrConLogo(token, institucion.logo_base64, absolutePath);
        if (ok) {
          await prisma.codigoQr.update({ where: { id: qr.id }, data: { png_path: relativePath } });
        }
      }
    }

    // Crear docentes
    const personal = [
      {
        carnet: 'D001',
        nombres: 'Roberto',
        apellidos: 'Profesional Silva',
        sexo: 'M',
        cargo: 'Docente',
        jornada: 'Matutina'
      },
      {
        carnet: 'D002',
        nombres: 'Laura',
        apellidos: 'Enseñanza González',
        sexo: 'F',
        cargo: 'Directora',
        jornada: 'Vespertina'
      }
    ];

    console.log('👨‍🏫 Creando docentes...');
    for (const p of personal) {
      const existing = await prisma.personal.findUnique({
        where: { carnet: p.carnet }
      }).catch(() => null);

      if (!existing) {
        const created = await prisma.personal.create({ data: p });
        console.log(`  ✓ ${p.carnet}: ${p.nombres}`);

        // Generar QR para personal
        const token = tokenService.generarToken('personal', created.id);
        const qr = await prisma.codigoQr.create({
          data: {
            persona_tipo: 'personal',
            personal_id: created.id,
            token,
            vigente: true
          }
        });
        const { relativePath, absolutePath } = qrService.obtenerRutasQr('personal', created.carnet);
        const ok = await qrService.generarQrConLogo(token, institucion.logo_base64, absolutePath);
        if (ok) {
          await prisma.codigoQr.update({ where: { id: qr.id }, data: { png_path: relativePath } });
        }
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


