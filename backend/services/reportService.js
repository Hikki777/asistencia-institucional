const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const path = require('path');
const prisma = require('../prismaClient');
const { logger } = require('../utils/logger');

const os = require('os');

class ReportService {
  constructor() {
    this.reportsDir = path.join(os.tmpdir(), 'hikari-reports');
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

    logger.info({ filtros }, '📄 Iniciando generación de PDF');
    
    // Construir query con filtros
    const where = this.construirFiltros(filtros);
    logger.debug({ where }, '🔍 Filtros construidos');

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

    logger.info({ count: asistencias.length }, `📊 Asistencias encontradas para reporte PDF`);

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
        doc.image(logoPath, 50, startY, { width: 70, height: 70 });
        logger.debug('✅ Logo agregado al PDF');
      } catch (error) {
        logger.warn({ err: error }, '⚠️ No se pudo cargar el logo en PDF');
      }
    } else {
      logger.debug('ℹ️ No se encontró logo institucional para PDF');
    }

    // Encabezado institucional (centrado al lado del logo)
    const headerX = 130;
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1F4788')
      .text(institucion?.nombre || 'Instituto Educativo', headerX, startY + 10, { align: 'left' });
    
    doc.fontSize(10).font('Helvetica').fillColor('#000000');
    if (institucion?.direccion || institucion?.telefono) {
      const infoText = [];
      if (institucion?.direccion) infoText.push(institucion.direccion);
      if (institucion?.telefono) infoText.push(`Tel: ${institucion.telefono}`);
      doc.text(infoText.join(' | '), headerX, startY + 35);
    }
    
    // Título del reporte
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000')
      .text('REPORTE DE ASISTENCIAS', 50, startY + 55, {
        align: 'center',
        width: 500
      });
    
    // Línea separadora
    doc.moveTo(50, startY + 75).lineTo(550, startY + 75).stroke();
    
    // Información compacta de filtros y estadísticas
    doc.fontSize(9).font('Helvetica');
    const stats = this.calcularEstadisticas(asistencias);
    const filterInfo = [];
    if (fechaInicio) filterInfo.push(`Desde: ${new Date(fechaInicio).toLocaleDateString('es-ES')}`);
    if (fechaFin) filterInfo.push(`Hasta: ${new Date(fechaFin).toLocaleDateString('es-ES')}`);
    if (personaTipo) filterInfo.push(`Tipo: ${personaTipo === 'alumno' ? 'Alumnos' : 'Personal'}`);
    if (grado) filterInfo.push(`Grado: ${grado}`);
    
    const infoLine = `Filtros: ${filterInfo.length > 0 ? filterInfo.join(' | ') : 'Ninguno'} • Total: ${asistencias.length} | Entradas: ${stats.entradas} | Salidas: ${stats.salidas} | Puntuales: ${stats.puntuales} | Tardíos: ${stats.tardes}`;
    doc.text(infoLine, 50, startY + 85, { align: 'center', width: 500 });
    
    // Posición para la tabla
    let tableY = startY + 115;
    
    // Tabla de datos (manual para mayor control)
    logger.debug({ count: asistencias.length }, '📋 Generando tabla de asistencias en PDF');
    if (asistencias.length > 0) {
      // Encabezados de tabla
      const headers = ['Fecha/Hora', 'Carnet', 'Nombre Completo', 'Grado', 'Tipo', 'Estado'];
      const colWidths = [85, 60, 160, 60, 45, 50];
      const startX = 50;
      
      // Dibujar encabezados
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.rect(startX, tableY, 460, 20).fill('#1F4788');
      
      let currentX = startX + 5;
      doc.fillColor('#FFFFFF');
      headers.forEach((header, i) => {
        doc.text(header, currentX, tableY + 5, { width: colWidths[i] - 10, align: 'center' });
        currentX += colWidths[i];
      });
      
      tableY += 20;
      
      // Dibujar filas de datos
      doc.fontSize(8).font('Helvetica').fillColor('#000000');
      let rowCount = 0;
      
      for (const a of asistencias) {
        // Verificar si necesitamos nueva página
        if (tableY > 720) {
          doc.addPage();
          tableY = 50;
          
          // Re-dibujar encabezados en nueva página
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
          doc.rect(startX, tableY, 460, 20).fill('#1F4788');
          
          currentX = startX + 5;
          doc.fillColor('#FFFFFF');
          headers.forEach((header, i) => {
            doc.text(header, currentX, tableY + 5, { width: colWidths[i] - 10, align: 'center' });
            currentX += colWidths[i];
          });
          
          tableY += 20;
          doc.fontSize(8).font('Helvetica').fillColor('#000000');
        }
        
        const persona = a.alumno || a.personal;
        const rowData = [
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
        
        // Fondo alternado
        if (rowCount % 2 === 0) {
          doc.rect(startX, tableY, 460, 18).fillAndStroke('#F9F9F9', '#E0E0E0');
        } else {
          doc.rect(startX, tableY, 460, 18).stroke('#E0E0E0');
        }
        
        // Dibujar datos
        currentX = startX + 5;
        rowData.forEach((data, i) => {
          doc.text(String(data), currentX, tableY + 4, { width: colWidths[i] - 10, align: 'center' });
          currentX += colWidths[i];
        });
        
        tableY += 18;
        rowCount++;
      }
      
      logger.debug({ rowCount }, `✅ Tabla PDF generada con ${rowCount} filas`);
    } else {
      doc.fontSize(10).text('No se encontraron registros con los filtros aplicados.', 50, tableY, { align: 'center' });
    }

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      `Generado por HikariOpen - Página ${doc.bufferedPageRange().count}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

    logger.debug({ fileName }, '⏳ Esperando finalización del PDF');
    
    // Esperar a que termine de escribir
    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        logger.info({ fileName, filePath }, '✅ PDF generado exitosamente');
        resolve();
      });
      stream.on('error', (err) => {
        logger.error({ err, fileName }, '❌ Error generando PDF');
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

    logger.info({ filtros }, '📊 Iniciando generación de Excel');

    // Obtener institución
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });

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
            grado: true,
            jornada: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    logger.info({ count: asistencias.length }, `📊 Asistencias encontradas para reporte Excel`);

    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HikariOpen';
    workbook.created = new Date();

    // ===== HOJA ÚNICA: REPORTE DE ASISTENCIAS =====
    const sheet = workbook.addWorksheet('Reporte de Asistencias', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    });

    // Fila 1: Logo en A1 y Nombre de institución en C1
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
        // Logo en A1:A2 (solo columna A)
        sheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 60, height: 60 }
        });
        sheet.getRow(1).height = 30;
        sheet.getRow(2).height = 30;
        logger.debug('✅ Logo agregado al Excel');
      } catch (error) {
        logger.warn({ err: error }, '⚠️ No se pudo cargar el logo en Excel');
      }
    }

    // Nombre de la institución en C1:L1 (para no chocar con logo en A1)
    sheet.mergeCells('C1:L1');
    const titleCell = sheet.getCell('C1');
    titleCell.value = institucion?.nombre || 'Instituto Educativo';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FF1F4788' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Fila 4: Título del reporte
    sheet.mergeCells('A4:L4');
    const reportTitle = sheet.getCell('A4');
    reportTitle.value = 'REPORTE DE ASISTENCIAS';
    reportTitle.font = { size: 14, bold: true };
    reportTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    reportTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };
    sheet.getRow(4).height = 25;

    // Fila 6: Filtros y estadísticas
    sheet.mergeCells('A6:L6');
    const filterCell = sheet.getCell('A6');
    const filterParts = [];
    if (fechaInicio) filterParts.push(`Desde: ${new Date(fechaInicio).toLocaleDateString('es-ES')}`);
    if (fechaFin) filterParts.push(`Hasta: ${new Date(fechaFin).toLocaleDateString('es-ES')}`);
    filterCell.value = `Filtros: ${filterParts.length > 0 ? filterParts.join(' | ') : 'Sin filtros'} • Total: ${asistencias.length} | Entradas: ${stats.entradas} | Salidas: ${stats.salidas} | Puntuales: ${stats.puntuales} | Tardíos: ${stats.tardes}`;
    filterCell.font = { size: 10, italic: true };
    filterCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(6).height = 20;

    // Fila 8: Encabezados de la tabla
    const headers = ['Fecha', 'Hora', 'Carnet', 'Nombre Completo', 'Grado', 'Tipo', 'Evento', 'Estado', 'Origen'];
    const headerRow = sheet.getRow(8);
    
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4788' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 25;

    // Datos de asistencias (comienza en fila 9)
    let currentRow = 9;
    asistencias.forEach((a, index) => {
      const persona = a.alumno || a.personal;
      const row = sheet.getRow(currentRow);
      
      const rowData = [
        new Date(a.timestamp).toLocaleDateString('es-ES'),
        new Date(a.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        persona?.carnet || 'N/A',
        `${persona?.nombres || ''} ${persona?.apellidos || ''}`.trim() || 'N/A',
        persona?.grado || 'N/A',
        a.alumno ? 'Alumno' : 'Personal',
        a.tipo_evento === 'entrada' ? 'Entrada' : 'Salida',
        a.estado_puntualidad?.toUpperCase() || 'N/A',
        a.origen || 'N/A'
      ];

      rowData.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        
        // Colores específicos para ciertas columnas
        if (colIndex === 5) { // Columna Tipo
          cell.font = { color: { argb: value === 'Alumno' ? 'FFFF8C00' : 'FF000000' } };
        }
        if (colIndex === 6) { // Columna Evento
          cell.font = { color: { argb: value === 'Entrada' ? 'FF0000FF' : 'FFFF0000' } };
        }
        if (colIndex === 7) { // Columna Estado
          cell.font = { color: { argb: value === 'TARDE' ? 'FFFF0000' : 'FF000000' } };
        }
      });

      row.height = 20;
      currentRow++;
    });

    // Ajustar anchos de columna (columna A más angosta para el logo)
    sheet.getColumn(1).width = 12;  // Fecha
    sheet.getColumn(2).width = 8;   // Hora
    sheet.getColumn(3).width = 12;  // Carnet
    sheet.getColumn(4).width = 30;  // Nombre Completo
    sheet.getColumn(5).width = 12;  // Grado
    sheet.getColumn(6).width = 10;  // Tipo
    sheet.getColumn(7).width = 10;  // Evento
    sheet.getColumn(8).width = 10;  // Estado
    sheet.getColumn(9).width = 10;  // Origen

    // Guardar archivo
    const fileName = `reporte_asistencias_${Date.now()}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);
    
    await workbook.xlsx.writeFile(filePath);
    logger.info({ fileName, filePath }, '✅ Excel generado exitosamente');

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
          logger.debug({ file }, `🗑️ Archivo temporal eliminado`);
        }
      }
    } catch (error) {
      logger.error({ err: error }, '❌ Error limpiando archivos temporales');
    }
  }
}

module.exports = new ReportService();
