const prisma = require('./backend/prismaClient');

async function main() {
  const alumnos = await prisma.alumno.findMany({ take: 3 });
  const personal = await prisma.personal.findMany();
  
  console.log('📚 ALUMNOS DISPONIBLES:');
  alumnos.forEach(a => console.log(`  ${a.carnet}: ${a.nombres} ${a.apellidos} (ID: ${a.id})`));
  
  console.log('\n👨‍🏫 PERSONAL DISPONIBLE:');
  personal.forEach(p => console.log(`  ${p.carnet}: ${p.nombres} ${p.apellidos} (ID: ${p.id})`));
  
  await prisma.$disconnect();
}

main();
