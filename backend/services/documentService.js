const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { UPLOADS_DIR } = require('../utils/paths');
const { logger } = require('../utils/logger');
const prisma = require('../prismaClient');

/**
 * Servicio de Generación de Documentos Oficiales
 * Genera PDFs para constancias, cartas, certificados, etc.
 */

/**
 * Configuración de estilos de documento
 */
const STYLES = {
  title: { fontSize: 18, font: 'Helvetica-Bold' },
  subtitle: { fontSize: 14, font: 'Helvetica-Bold' },
  body: { fontSize: 12, font: 'Helvetica' },
  small: { fontSize: 10, font: 'Helvetica' },
  margin: { top: 50, left: 50, right: 50, bottom: 50 }
};

/**
 * Genera encabezado institucional
 */
const generarEncabezado = async (doc, institucion) => {
  const { margin } = STYLES;
  
  // Logo institucional (si existe)
  if (institucion.logo_path) {
    const logoPath = path.join(UPLOADS_DIR, 'logos', institucion.logo_path);
    if (await fs.pathExists(logoPath)) {
      doc.image(logoPath, margin.left, margin.top, { width: 60 });
    }
  }
  
  // Nombre de la institución
  doc.font(STYLES.title.font)
     .fontSize(STYLES.title.fontSize)
     .text(institucion.nombre, margin.left + 80, margin.top, {
       width: doc.page.width - margin.left - margin.right - 80,
       align: 'center'
     });
  
  // Dirección y contacto
  if (institucion.direccion || institucion.telefono) {
    doc.font(STYLES.small.font)
       .fontSize(STYLES.small.fontSize)
       .moveDown(0.5);
    
    if (institucion.direccion) {
      doc.text(institucion.direccion, { align: 'center' });
    }
    if (institucion.telefono) {
      doc.text(`Tel: ${institucion.telefono}`, { align: 'center' });
    }
  }
  
  doc.moveDown(2);
  return doc.y;
};

/**
 * Genera pie de página
 */
const generarPieDePagina = (doc, numeroPagina = 1) => {
  const { margin } = STYLES;
  const bottomY = doc.page.height - margin.bottom;
  
  doc.font(STYLES.small.font)
     .fontSize(STYLES.small.fontSize)
     .text(
       `Página ${numeroPagina}`,
       margin.left,
       bottomY,
       { align: 'center', width: doc.page.width - margin.left - margin.right }
     );
  
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-ES')}`,
    margin.left,
    bottomY + 15,
    { align: 'center', width: doc.page.width - margin.left - margin.right }
  );
};

/**
 * Genera Constancia de Inscripción
 */
const generarConstanciaInscripcion = async (alumnoId) => {
  try {
    // Obtener datos
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    const institucion = await prisma.institucion.findFirst();
    
    if (!alumno || !institucion) {
      throw new Error('Alumno o institución no encontrados');
    }
    
    // Crear documento
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const filename = `constancia_inscripcion_${alumno.carnet}_${Date.now()}.pdf`;
    const filepath = path.join(UPLOADS_DIR, 'documentos', filename);
    
    await fs.ensureDir(path.join(UPLOADS_DIR, 'documentos'));
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // Encabezado
    await generarEncabezado(doc, institucion);
    
    // Título del documento
    doc.font(STYLES.subtitle.font)
       .fontSize(STYLES.subtitle.fontSize)
       .text('CONSTANCIA DE INSCRIPCIÓN', { align: 'center', underline: true })
       .moveDown(2);
    
    // Cuerpo
    doc.font(STYLES.body.font)
       .fontSize(STYLES.body.fontSize);
    
    const textoConstancia = `Por medio de la presente, se hace constar que el/la estudiante ${alumno.nombres} ${alumno.apellidos}, identificado/a con carnet No. ${alumno.carnet}, se encuentra debidamente inscrito/a en esta institución educativa para el año escolar en curso.

El/la estudiante cursa actualmente el grado: ${alumno.grado}${alumno.carrera ? `, en la carrera de ${alumno.carrera}` : ''}.

Estado del estudiante: ${alumno.estado.toUpperCase()}
${alumno.anio_ingreso ? `Año de ingreso: ${alumno.anio_ingreso}` : ''}

Se extiende la presente constancia a solicitud del interesado/a para los fines que estime conveniente.`;
    
    doc.text(textoConstancia, { align: 'justify', lineGap: 5 });
    
    // Fecha y firma
    doc.moveDown(3);
    doc.text(`Dado en ${institucion.municipio || '[Ciudad]'}, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-ES', { month: 'long' })} de ${new Date().getFullYear()}.`, {
      align: 'center'
    });
    
    doc.moveDown(4);
    doc.text('_______________________________', { align: 'center' });
    doc.text('Firma y Sello', { align: 'center' });
    doc.text('Director/a', { align: 'center' });
    
    // Pie de página
    generarPieDePagina(doc);
    
    doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        logger.info({ alumnoId, filepath }, 'Constancia de inscripción generada');
        resolve({ filepath, filename, url: `/uploads/documentos/${filename}` });
      });
      stream.on('error', reject);
    });
    
  } catch (error) {
    logger.error({ err: error, alumnoId }, 'Error generando constancia de inscripción');
    throw error;
  }
};

/**
 * Genera Carta de Buena Conducta
 */
const generarCartaBuenaConducta = async (alumnoId, periodo = null) => {
  try {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    const institucion = await prisma.institucion.findFirst();
    
    if (!alumno || !institucion) {
      throw new Error('Alumno o institución no encontrados');
    }
    
    // Calcular asistencias (últimos 30 días o período especificado)
    const fechaInicio = periodo?.inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fechaFin = periodo?.fin || new Date();
    
    const asistencias = await prisma.asistencia.count({
      where: {
        alumno_id: alumnoId,
        timestamp: { gte: fechaInicio, lte: fechaFin }
      }
    });
    
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const filename = `carta_conducta_${alumno.carnet}_${Date.now()}.pdf`;
    const filepath = path.join(UPLOADS_DIR, 'documentos', filename);
    
    await fs.ensureDir(path.join(UPLOADS_DIR, 'documentos'));
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    await generarEncabezado(doc, institucion);
    
    doc.font(STYLES.subtitle.font)
       .fontSize(STYLES.subtitle.fontSize)
       .text('CARTA DE BUENA CONDUCTA', { align: 'center', underline: true })
       .moveDown(2);
    
    doc.font(STYLES.body.font)
       .fontSize(STYLES.body.fontSize);
    
    const textoCarta = `Por medio de la presente, hacemos constar que el/la estudiante ${alumno.nombres} ${alumno.apellidos}, identificado/a con carnet No. ${alumno.carnet}, quien cursa el grado ${alumno.grado}${alumno.carrera ? ` en la carrera de ${alumno.carrera}` : ''}, ha demostrado durante su permanencia en esta institución educativa:

• EXCELENTE COMPORTAMIENTO en el aula y en todas las actividades institucionales
• RESPETO hacia sus compañeros, docentes y personal administrativo
• CUMPLIMIENTO de las normas y reglamentos institucionales
• ASISTENCIA REGULAR a clases (${asistencias} registros de asistencia en el período evaluado)
• ACTITUD POSITIVA y colaborativa en el ambiente escolar

Durante el tiempo que ha permanecido en nuestra institución, no se ha registrado ninguna falta disciplinaria grave que amerite sanción.

Se extiende la presente carta a solicitud del interesado/a, para los fines que estime conveniente.`;
    
    doc.text(textoCarta, { align: 'justify', lineGap: 5 });
    
    doc.moveDown(3);
    doc.text(`Dado en ${institucion.municipio || '[Ciudad]'}, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-ES', { month: 'long' })} de ${new Date().getFullYear()}.`, {
      align: 'center'
    });
    
    doc.moveDown(4);
    doc.text('_______________________________', { align: 'center' });
    doc.text('Firma y Sello', { align: 'center' });
    doc.text('Director/a', { align: 'center' });
    
    generarPieDePagina(doc);
    doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        logger.info({ alumnoId, filepath }, 'Carta de buena conducta generada');
        resolve({ filepath, filename, url: `/uploads/documentos/${filename}` });
      });
      stream.on('error', reject);
    });
    
  } catch (error) {
    logger.error({ err: error, alumnoId }, 'Error generando carta de buena conducta');
    throw error;
  }
};

/**
 * Genera Certificado de Estudios
 */
const generarCertificadoEstudios = async (alumnoId) => {
  try {
    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: { historial: { orderBy: { anio_escolar: 'asc' } } }
    });
    const institucion = await prisma.institucion.findFirst();
    
    if (!alumno || !institucion) {
      throw new Error('Alumno o institución no encontrados');
    }
    
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const filename = `certificado_estudios_${alumno.carnet}_${Date.now()}.pdf`;
    const filepath = path.join(UPLOADS_DIR, 'documentos', filename);
    
    await fs.ensureDir(path.join(UPLOADS_DIR, 'documentos'));
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    await generarEncabezado(doc, institucion);
    
    doc.font(STYLES.subtitle.font)
       .fontSize(STYLES.subtitle.fontSize)
       .text('CERTIFICADO DE ESTUDIOS', { align: 'center', underline: true })
       .moveDown(2);
    
    doc.font(STYLES.body.font)
       .fontSize(STYLES.body.fontSize);
    
    doc.text(`Se certifica que el/la estudiante ${alumno.nombres} ${alumno.apellidos}, identificado/a con carnet No. ${alumno.carnet}, ha cursado los siguientes grados en esta institución educativa:`, {
      align: 'justify'
    });
    
    doc.moveDown(1);
    
    // Historial académico
    if (alumno.historial && alumno.historial.length > 0) {
      doc.font(STYLES.subtitle.font).fontSize(12).text('Historial Académico:', { underline: true });
      doc.moveDown(0.5);
      
      alumno.historial.forEach((registro) => {
        doc.font(STYLES.body.font).fontSize(STYLES.body.fontSize);
        doc.text(`• Año ${registro.anio_escolar}: ${registro.grado_cursado} - ${registro.promovido ? 'APROBADO' : 'REPROBADO'}${registro.carrera ? ` (${registro.carrera})` : ''}`);
      });
    } else {
      doc.text('(Sin historial académico registrado)');
    }
    
    doc.moveDown(1);
    doc.text(`Grado actual: ${alumno.grado}`);
    doc.text(`Estado: ${alumno.estado.toUpperCase()}`);
    if (alumno.anio_ingreso) {
      doc.text(`Año de ingreso: ${alumno.anio_ingreso}`);
    }
    if (alumno.anio_graduacion) {
      doc.text(`Año de graduación: ${alumno.anio_graduacion}`);
    }
    
    doc.moveDown(2);
    doc.text('Se extiende el presente certificado a solicitud del interesado/a.', { align: 'justify' });
    
    doc.moveDown(2);
    doc.text(`Dado en ${institucion.municipio || '[Ciudad]'}, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-ES', { month: 'long' })} de ${new Date().getFullYear()}.`, {
      align: 'center'
    });
    
    doc.moveDown(4);
    doc.text('_______________________________', { align: 'center' });
    doc.text('Firma y Sello', { align: 'center' });
    doc.text('Director/a', { align: 'center' });
    
    generarPieDePagina(doc);
    doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        logger.info({ alumnoId, filepath }, 'Certificado de estudios generado');
        resolve({ filepath, filename, url: `/uploads/documentos/${filename}` });
      });
      stream.on('error', reject);
    });
    
  } catch (error) {
    logger.error({ err: error, alumnoId }, 'Error generando certificado de estudios');
    throw error;
  }
};

module.exports = {
  generarConstanciaInscripcion,
  generarCartaBuenaConducta,
  generarCertificadoEstudios
};
