const prisma = require('./backend/prismaClient');

(async () => {
  try {
    const alumnos = await prisma.alumno.findMany();
    const docentes = await prisma.personal.findMany();
    
    console.log('\n📊 Datos en la base de datos:');
    console.log(`   Alumnos: ${alumnos.length}`);
    console.log(`   Docentes: ${docentes.length}`);
    
    if (alumnos.length > 0) {
      console.log('\n👨‍🎓 Alumnos:');
      alumnos.forEach(a => console.log(`   - ${a.carnet}: ${a.nombres} ${a.apellidos}`));
    }
    
    if (docentes.length > 0) {
      console.log('\n👨‍🏫 Docentes:');
      docentes.forEach(p => console.log(`   - ${p.carnet}: ${p.nombres} ${p.apellidos}`));
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

