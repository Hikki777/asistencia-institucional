const prisma = require('./prismaClient');

async function main(){
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  try {
    const asistencias = await prisma.asistencia.findMany({
      where: { timestamp: { gte: hoy, lt: manana } },
      orderBy: { timestamp: 'desc' },
      include: {
        alumno: { select: { id: true, carnet: true, nombres: true, apellidos: true, grado: true, jornada: true } },
        personal: { select: { id: true, carnet: true, nombres: true, apellidos: true, cargo: true, jornada: true } }
      }
    });
    console.log('OK asistencias hoy:', asistencias.length);
    process.exit(0);
  } catch (err) {
    console.error('Error prisma:', err);
    process.exit(1);
  }
}

main();
