#!/usr/bin/env node
/**
 * Utilidades de Base de Datos - Sistema de Registro Institucional
 * Herramienta CLI consolidada para gestión de datos
 */

const prisma = require('./backend/prismaClient');

const commands = {
  'list': async () => {
    console.log('\n[SYSTEM] === DATOS DEL SISTEMA ===\n');
    
    const alumnos = await prisma.alumno.count();
    const personal = await prisma.personal.count();
    const asistencias = await prisma.asistencia.count();
    const qrs = await prisma.codigoQr.count();
    const usuarios = await prisma.usuario.count();
    
    console.log(`[ALUMNOS] Alumnos:      ${alumnos}`);
    console.log(`[PERSONAL] Personal:     ${personal}`);
    console.log(`[ASISTENCIAS] Asistencias:  ${asistencias}`);
    console.log(`[QR] Codigos QR:   ${qrs}`);
    console.log(`[USERS] Usuarios:     ${usuarios}`);
    
    const institucion = await prisma.institucion.findFirst();
    if (institucion) {
      console.log(`\n[INSTITUCION] Institucion: ${institucion.nombre}`);
      console.log(`   Inicializada: ${institucion.inicializado ? '[OK]' : '[NO]'}`);
    }
  },
  
  'alumnos': async () => {
    const alumnos = await prisma.alumno.findMany({
      take: 20,
      orderBy: { carnet: 'asc' }
    });
    
    console.log('\n[ALUMNOS] === ALUMNOS (primeros 20) ===\n');
    alumnos.forEach(a => {
      console.log(`   ${a.carnet}: ${a.nombres} ${a.apellidos} - ${a.grado} (${a.jornada})`);
    });
    console.log(`\n   Total: ${await prisma.alumno.count()}`);
  },
  
  'personal': async () => {
    const personal = await prisma.personal.findMany({
      orderBy: { carnet: 'asc' }
    });
    
    console.log('\n[PERSONAL] === PERSONAL ===\n');
    personal.forEach(p => {
      console.log(`   ${p.carnet}: ${p.nombres} ${p.apellidos} - ${p.cargo} (${p.jornada})`);
    });
    console.log(`\n   Total: ${personal.length}`);
  },
  
  'asistencias-hoy': async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const asistencias = await prisma.asistencia.findMany({
      where: {
        timestamp: { gte: hoy, lt: manana }
      },
      include: {
        alumno: { select: { carnet: true, nombres: true, apellidos: true } },
        personal: { select: { carnet: true, nombres: true, apellidos: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    console.log(`\n[ASISTENCIAS] === ASISTENCIAS HOY (${asistencias.length}) ===\n`);
    
    const entradas = asistencias.filter(a => a.tipo_evento === 'entrada').length;
    const salidas = asistencias.filter(a => a.tipo_evento === 'salida').length;
    
    console.log(`   Entradas: ${entradas}`);
    console.log(`   Salidas:  ${salidas}\n`);
    
    asistencias.slice(0, 10).forEach(a => {
      const persona = a.alumno || a.personal;
      const tipo = a.tipo_evento === 'entrada' ? '>> ' : '<< ';
      console.log(`   ${tipo} ${persona.carnet}: ${persona.nombres} ${persona.apellidos} - ${a.timestamp.toLocaleTimeString('es-ES')}`);
    });
    
    if (asistencias.length > 10) {
      console.log(`   ... y ${asistencias.length - 10} mas`);
    }
  },
  
  'qrs': async () => {
    const qrs = await prisma.codigoQr.findMany({
      include: {
        alumno: { select: { carnet: true, nombres: true, apellidos: true } },
        personal: { select: { carnet: true, nombres: true, apellidos: true } }
      }
    });
    
    console.log('\n[QR] === CODIGOS QR ===\n');
    
    const vigentes = qrs.filter(q => q.vigente).length;
    const expirados = qrs.filter(q => !q.vigente).length;
    
    console.log(`   Vigentes:   ${vigentes}`);
    console.log(`   Expirados:  ${expirados}`);
    console.log(`   Total:      ${qrs.length}\n`);
  },
  
  'health': async () => {
    console.log('\n[HEALTH] === SALUD DEL SISTEMA ===\n');
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('   Base de datos: [OK]');
      
      const alumnos = await prisma.alumno.count();
      const personal = await prisma.personal.count();
      const asistencias = await prisma.asistencia.count();
      
      console.log('   Tablas verificadas: [OK]');
      console.log(`   Registros totales: ${alumnos + personal + asistencias}`);
      
      const qrsSinArchivo = await prisma.codigoQr.findMany({
        where: {
          vigente: true,
          OR: [
            { qr_path: null },
            { qr_path: '' }
          ]
        }
      });
      
      if (qrsSinArchivo.length > 0) {
        console.log(`   [WARN] QRs sin archivo: ${qrsSinArchivo.length}`);
      } else {
        console.log('   QRs: [OK]');
      }
      
      console.log('\n[OK] Sistema operativo');
    } catch (error) {
      console.log('   [ERROR] Error:', error.message);
    }
  },
  
  'help': () => {
    console.log(`
================================================================================
  [UTILS] Utilidades de Base de Datos
================================================================================

Uso: node utils.js <comando>

Comandos disponibles:

  list              Resumen de datos del sistema
  alumnos           Listar alumnos (primeros 20)
  personal          Listar personal completo
  asistencias-hoy   Asistencias del dia actual
  qrs               Estado de codigos QR
  health            Verificar salud del sistema
  help              Mostrar esta ayuda

Ejemplos:
  node utils.js list
  node utils.js alumnos
  node utils.js health
    `);
  }
};

async function main() {
  const command = process.argv[2] || 'help';
  
  if (!commands[command]) {
    console.error(`\n[ERROR] Comando desconocido: ${command}`);
    commands.help();
    process.exit(1);
  }
  
  try {
    await commands[command]();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Error:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
