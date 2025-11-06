const PDFDocument = require('pdfkit');
require('pdfkit-table'); // Extiende PDFDocument
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');
const prisma = require('../prismaClient');

class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../temp-reports');
    this.ensureReportsDir();
  }

  async ensureReportsDir() {
    await fs.ensureDir(this.reportsDir);
  }

  /**
   * Generar reporte de asistencias en PDF
   */
  async generarReportePDF(filtros = {}) {
    const { fechaInicio, fechaFin, personaTipo, grado, tipoEvento } = filtros;

    console.log('📄 Iniciando generación de PDF...');
    
    // Construir query con filtros
    const where = this.construirFiltros(filtros);
    console.log('🔍 Filtros construidos:', JSON.stringify(where, null, 2));

    // Obtener datos
    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        alumno: {
          select: {
            carnet: true,
            nombres: true,
            apellidos: true,
            grado: true,
            jornada: true
          }
        },
        personal: {
          select: {
            carnet: true,
            nombres: true,
            apellidos: true,
            grado: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    console.log(`📊 Asistencias encontradas: ${asistencias.length}`);

    // Obtener institución
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });

    // Crear PDF
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const fileName = `reporte_asistencias_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Logo institucional (si existe)
    let logoPath = path.join(__dirname, '../../uploads/logos/logo.png');
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '../../uploads/logos/logo_institucion.png');
    }
    
    let startY = 50; // Posición inicial
    
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, startY, { width: 60, height: 60 });
        console.log('✅ Logo agregado al PDF');
      } catch (error) {
        console.log('⚠️ No se pudo cargar el logo:', error.message);
      }
    } else {
      console.log('ℹ️ No se encontró logo institucional');
    }

    // Encabezado institucional (alineado con logo)
    const headerX = 120;
    doc.fontSize(16).font('Helvetica-Bold').text(institucion?.nombre || 'Instituto Educativo', headerX, startY);
    startY += 20;
    
    if (institucion?.direccion) {
      doc.fontSize(9).font('Helvetica').text(institucion.direccion, headerX, startY);
      startY += 12;
    }
    if (institucion?.telefono) {
      doc.fontSize(9).text(`Tel: ${institucion.telefono}`, headerX, startY);
      startY += 12;
    }
    
    // Línea separadora
    doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
    
    // Título del reporte (posición absoluta después del encabezado)
    doc.fontSize(14).font('Helvetica-Bold').text('REPORTE DE ASISTENCIAS', 50, startY + 25, { 
      align: 'center',
      width: 500
    });
    
    // Continuar desde una posición fija
    doc.y = startY + 50;

    // Información del reporte
    doc.fontSize(11).font('Helvetica-Bold').text('Información del Reporte:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`);
    doc.text(`Generado por: Sistema de Registro Institucional`);
    doc.moveDown(0.5);

    // Filtros aplicados
    doc.fontSize(11).font('Helvetica-Bold').text('Filtros Aplicados:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Fecha inicio: ${fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES') : 'No especificado'}`);
    doc.text(`Fecha fin: ${fechaFin ? new Date(fechaFin).toLocaleDateString('es-ES') : 'No especificado'}`);
    doc.text(`Tipo de persona: ${personaTipo ? (personaTipo === 'alumno' ? 'Alumnos' : 'Personal') : 'Todos'}`);
    doc.text(`Grado: ${grado || 'Todos'}`);
    doc.text(`Tipo de evento: ${tipoEvento ? (tipoEvento === 'entrada' ? 'Entradas' : 'Salidas') : 'Todos'}`);
    doc.moveDown(0.5);

    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);
    doc.fontSize(11).font('Helvetica-Bold').text('Resumen Estadístico:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total de registros: ${asistencias.length}`);
    doc.text(`Entradas: ${stats.entradas} | Salidas: ${stats.salidas}`);
    doc.text(`Puntuales: ${stats.puntuales} | Tardíos: ${stats.tardes}`);
    doc.text(`Registros por QR: ${stats.porQR} | Registros manuales: ${stats.manual}`);
    doc.moveDown();

    // Tabla de datos - Nueva página para asegurar espacio
    doc.addPage();
    doc.fontSize(14).text('REGISTROS DE ASISTENCIA', { align: 'center', underline: true });
    doc.moveDown(2);
    
    console.log('📋 Generando tabla con', asistencias.length, 'registros...');
    if (asistencias.length > 0) {
      const tableData = {
        headers: ['Fecha/Hora', 'Carnet', 'Nombre Completo', 'Grado', 'Tipo', 'Estado'],
        rows: asistencias.map(a => {
          const persona = a.alumno || a.personal;
          return [
            new Date(a.timestamp).toLocaleString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: '2-digit',
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            persona?.carnet || 'N/A',
            `${persona?.nombres || ''} ${persona?.apellidos || ''}`.trim() || 'Desconocido',
            persona?.grado || 'N/A',
            a.tipo_evento === 'entrada' ? 'ENT' : 'SAL',
            a.estado_puntualidad?.toUpperCase() || 'N/A'
          ];
        })
      };

      console.log('📊 Tabla creada con', tableData.rows.length, 'filas');
      
      // Usar pdfkit-table con configuración explícita
      await doc.table(tableData, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font('Helvetica').fontSize(8);
        },
        columnsSize: [90, 60, 130, 60, 50, 60],
        x: 50,
        y: doc.y
      });
      
      console.log('✅ Tabla agregada al PDF');
    } else {
      doc.fontSize(10).text('No se encontraron registros con los filtros aplicados.', { align: 'center' });
    }

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      `Generado por Sistema de Registro Institucional - Página ${doc.bufferedPageRange().count}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

    console.log('⏳ Esperando finalización del PDF...');
    
    // Esperar a que termine de escribir
    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('✅ PDF generado exitosamente:', fileName);
        resolve();
      });
      stream.on('error', (err) => {
        console.error('❌ Error generando PDF:', err);
        reject(err);
      });
    });

    return { filePath, fileName };
  }

  /**
   * Generar reporte de asistencias en Excel con ExcelJS
   */
  async generarReporteExcel(filtros = {}) {
    const { fechaInicio, fechaFin, personaTipo, grado, tipoEvento } = filtros;
    const where = this.construirFiltros(filtros);

    console.log('📊 Iniciando generación de Excel...');

    // Obtener institución
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });

    // Obtener datos
    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        alumno: true,
        personal: true
      },
      orderBy: { timestamp: 'desc' }
    });

    console.log(`📊 Asistencias encontradas: ${asistencias.length}`);

    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Registro Institucional';
    workbook.created = new Date();

    // ===== HOJA 1: INFORMACIÓN =====
    const infoSheet = workbook.addWorksheet('Información', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // Logo (si existe) - Ajustado para no interferir con el contenido
    let logoPath = path.join(__dirname, '../../uploads/logos/logo.png');
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '../../uploads/logos/logo_institucion.png');
    }

    if (fs.existsSync(logoPath)) {
      try {
        const imageId = workbook.addImage({
          filename: logoPath,
          extension: 'png',
        });
        // Posicionar logo en la primera columna con altura de 4 filas
        infoSheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          br: { col: 1, row: 4 } // Desde columna A hasta B, filas 1-4
        });
        // Ajustar altura de las filas del logo
        for (let i = 1; i <= 4; i++) {
          infoSheet.getRow(i).height = 20;
        }
        console.log('✅ Logo agregado al Excel');
      } catch (error) {
        console.log('⚠️ No se pudo cargar el logo en Excel:', error.message);
      }
    }

    // Encabezado institucional (columnas C-F para no solaparse con logo)
    infoSheet.mergeCells('C1:F1');
    const titleCell = infoSheet.getCell('C1');
    titleCell.value = institucion?.nombre || 'Instituto Educativo';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1F4788' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    if (institucion?.direccion) {
      infoSheet.mergeCells('C2:F2');
      const dirCell = infoSheet.getCell('C2');
      dirCell.value = institucion.direccion;
      dirCell.font = { size: 10 };
      dirCell.alignment = { vertical: 'middle', horizontal: 'left' };
    }

    if (institucion?.telefono) {
      infoSheet.mergeCells('C3:F3');
      const telCell = infoSheet.getCell('C3');
      telCell.value = `Tel: ${institucion.telefono}`;
      telCell.font = { size: 10 };
      telCell.alignment = { vertical: 'middle', horizontal: 'left' };
    }

    // Título del reporte (después del logo y encabezado)
    infoSheet.mergeCells('A6:F6');
    const reportTitle = infoSheet.getCell('A6');
    reportTitle.value = 'REPORTE DE ASISTENCIAS';
    reportTitle.font = { size: 16, bold: true };
    reportTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    reportTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };
    infoSheet.getRow(6).height = 25;

    // Información del reporte
    let currentRow = 8;
    infoSheet.getCell(`A${currentRow}`).value = 'INFORMACIÓN DEL REPORTE';
    infoSheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Fecha de generación:';
    infoSheet.getCell(`B${currentRow}`).value = new Date().toLocaleString('es-ES');
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Generado por:';
    infoSheet.getCell(`B${currentRow}`).value = 'Sistema de Registro Institucional';
    currentRow += 2;

    // Filtros aplicados
    infoSheet.getCell(`A${currentRow}`).value = 'FILTROS APLICADOS';
    infoSheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Fecha inicio:';
    infoSheet.getCell(`B${currentRow}`).value = fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES') : 'No especificado';
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Fecha fin:';
    infoSheet.getCell(`B${currentRow}`).value = fechaFin ? new Date(fechaFin).toLocaleDateString('es-ES') : 'No especificado';
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Tipo de persona:';
    infoSheet.getCell(`B${currentRow}`).value = personaTipo ? (personaTipo === 'alumno' ? 'Alumnos' : 'Personal') : 'Todos';
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Grado:';
    infoSheet.getCell(`B${currentRow}`).value = grado || 'Todos';
    currentRow++;
    
    infoSheet.getCell(`A${currentRow}`).value = 'Tipo de evento:';
    infoSheet.getCell(`B${currentRow}`).value = tipoEvento ? (tipoEvento === 'entrada' ? 'Entradas' : 'Salidas') : 'Todos';
    currentRow += 2;

    // Resumen estadístico
    infoSheet.getCell(`A${currentRow}`).value = 'RESUMEN ESTADÍSTICO';
    infoSheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;
    
    const statsData = [
      ['Total de registros:', asistencias.length],
      ['Entradas:', stats.entradas],
      ['Salidas:', stats.salidas],
      ['Puntuales:', stats.puntuales],
      ['Tardíos:', stats.tardes],
      ['Registros por QR:', stats.porQR],
      ['Registros manuales:', stats.manual]
    ];

    statsData.forEach(([label, value]) => {
      infoSheet.getCell(`A${currentRow}`).value = label;
      infoSheet.getCell(`B${currentRow}`).value = value;
      infoSheet.getCell(`B${currentRow}`).font = { bold: true };
      currentRow++;
    });

    // Ajustar anchos de columna
    infoSheet.getColumn('A').width = 25;
    infoSheet.getColumn('B').width = 40;

    // ===== HOJA 2: DATOS DETALLADOS =====
    const dataSheet = workbook.addWorksheet('Asistencias');

    // Encabezados
    const headers = ['Fecha', 'Hora', 'Carnet', 'Nombres', 'Apellidos', 'Grado', 'Jornada', 
                     'Tipo Persona', 'Tipo Evento', 'Estado', 'Origen', 'Observaciones'];
    
    dataSheet.addRow(headers);
    
    // Estilo de encabezados
    const headerRow = dataSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4788' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20;

    // Datos
    asistencias.forEach(a => {
      const persona = a.alumno || a.personal;
      dataSheet.addRow([
        new Date(a.timestamp).toLocaleDateString('es-ES'),
        new Date(a.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        persona?.carnet || 'N/A',
        persona?.nombres || '',
        persona?.apellidos || '',
        persona?.grado || 'N/A',
        persona?.jornada || 'N/A',
        a.persona_tipo === 'alumno' ? 'Alumno' : 'Personal',
        a.tipo_evento === 'entrada' ? 'Entrada' : 'Salida',
        a.estado_puntualidad?.toUpperCase() || 'N/A',
        a.origen,
        a.observaciones || ''
      ]);
    });

    // Ajustar anchos de columna
    dataSheet.getColumn(1).width = 12;
    dataSheet.getColumn(2).width = 8;
    dataSheet.getColumn(3).width = 12;
    dataSheet.getColumn(4).width = 20;
    dataSheet.getColumn(5).width = 20;
    dataSheet.getColumn(6).width = 12;
    dataSheet.getColumn(7).width = 12;
    dataSheet.getColumn(8).width = 12;
    dataSheet.getColumn(9).width = 10;
    dataSheet.getColumn(10).width = 10;
    dataSheet.getColumn(11).width = 10;
    dataSheet.getColumn(12).width = 30;

    // Guardar archivo
    const fileName = `reporte_asistencias_${Date.now()}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);
    
    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Excel generado exitosamente:', fileName);

    return { filePath, fileName };
  }

  /**
   * Generar reporte por alumno específico
   */
  async generarReporteAlumno(alumnoId, formato = 'pdf') {
    const alumno = await prisma.alumno.findUnique({
      where: { id: parseInt(alumnoId) }
    });

    if (!alumno) {
      throw new Error('Alumno no encontrado');
    }

    const filtros = {
      personaTipo: 'alumno',
      alumnoId: parseInt(alumnoId)
    };

    if (formato === 'pdf') {
      return await this.generarReportePDF(filtros);
    } else {
      return await this.generarReporteExcel(filtros);
    }
  }

  /**
   * Construir objeto de filtros para Prisma
   */
  construirFiltros(filtros) {
    const where = {};

    if (filtros.fechaInicio || filtros.fechaFin) {
      where.timestamp = {};
      if (filtros.fechaInicio) {
        const inicio = new Date(filtros.fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        where.timestamp.gte = inicio;
      }
      if (filtros.fechaFin) {
        const fin = new Date(filtros.fechaFin);
        fin.setHours(23, 59, 59, 999);
        where.timestamp.lte = fin;
      }
    }

    if (filtros.personaTipo) {
      where.persona_tipo = filtros.personaTipo;
    }

    if (filtros.alumnoId) {
      where.alumno_id = parseInt(filtros.alumnoId);
    }

    if (filtros.personalId) {
      where.personal_id = parseInt(filtros.personalId);
    }

    if (filtros.tipoEvento) {
      where.tipo_evento = filtros.tipoEvento;
    }

    // Filtro por grado (requiere join)
    if (filtros.grado) {
      where.OR = [
        { alumno: { grado: filtros.grado } },
        { personal: { grado: filtros.grado } }
      ];
    }

    return where;
  }

  /**
   * Calcular estadísticas de asistencias
   */
  calcularEstadisticas(asistencias) {
    return {
      total: asistencias.length,
      entradas: asistencias.filter(a => a.tipo_evento === 'entrada').length,
      salidas: asistencias.filter(a => a.tipo_evento === 'salida').length,
      puntuales: asistencias.filter(a => a.estado_puntualidad === 'puntual').length,
      tardes: asistencias.filter(a => a.estado_puntualidad === 'tarde').length,
      porQR: asistencias.filter(a => a.origen === 'QR').length,
      manual: asistencias.filter(a => a.origen === 'Manual').length
    };
  }

  /**
   * Limpiar archivos temporales antiguos (más de 1 hora)
   */
  async limpiarArchivosTemporales() {
    try {
      const files = await fs.readdir(this.reportsDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.reportsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > oneHour) {
          await fs.unlink(filePath);
          console.log(`🗑️  Archivo temporal eliminado: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error limpiando archivos temporales:', error);
    }
  }
}

module.exports = new ReportService();
