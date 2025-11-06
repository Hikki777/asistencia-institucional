const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table');
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

    // Construir query con filtros
    const where = this.construirFiltros(filtros);

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

    // Obtener institución
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });

    // Crear PDF
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const fileName = `reporte_asistencias_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold').text(institucion?.nombre || 'Instituto Educativo', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Reporte de Asistencias', { align: 'center' });
    doc.moveDown();

    // Información del reporte
    doc.fontSize(10).font('Helvetica');
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, { align: 'left' });
    if (fechaInicio) doc.text(`Desde: ${new Date(fechaInicio).toLocaleDateString('es-ES')}`);
    if (fechaFin) doc.text(`Hasta: ${new Date(fechaFin).toLocaleDateString('es-ES')}`);
    if (personaTipo) doc.text(`Tipo: ${personaTipo === 'alumno' ? 'Alumnos' : 'Personal'}`);
    if (grado) doc.text(`Grado: ${grado}`);
    if (tipoEvento) doc.text(`Evento: ${tipoEvento === 'entrada' ? 'Entradas' : 'Salidas'}`);
    doc.text(`Total de registros: ${asistencias.length}`);
    doc.moveDown();

    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);
    doc.fontSize(12).font('Helvetica-Bold').text('Resumen:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Entradas: ${stats.entradas} | Salidas: ${stats.salidas}`);
    doc.text(`Puntuales: ${stats.puntuales} | Tardes: ${stats.tardes}`);
    doc.moveDown();

    // Tabla de datos
    if (asistencias.length > 0) {
      const tableData = {
        headers: ['Fecha/Hora', 'Carnet', 'Nombre Completo', 'Grado', 'Tipo', 'Estado'],
        rows: asistencias.map(a => {
          const persona = a.alumno || a.personal;
          return [
            new Date(a.timestamp).toLocaleString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            persona?.carnet || 'N/A',
            `${persona?.nombres || ''} ${persona?.apellidos || ''}`.trim() || 'Desconocido',
            persona?.grado || 'N/A',
            a.tipo_evento.toUpperCase(),
            a.estado_puntualidad?.toUpperCase() || '-'
          ];
        })
      };

      doc.moveDown();
      doc.table(tableData, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
        prepareRow: () => doc.font('Helvetica').fontSize(8),
        width: 500,
        columnsSize: [80, 60, 120, 60, 50, 60]
      });
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

    // Esperar a que termine de escribir
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return { filePath, fileName };
  }

  /**
   * Generar reporte de asistencias en Excel
   */
  async generarReporteExcel(filtros = {}) {
    const where = this.construirFiltros(filtros);

    // Obtener datos
    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        alumno: true,
        personal: true
      },
      orderBy: { timestamp: 'desc' }
    });

    // Preparar datos para Excel
    const datos = asistencias.map(a => {
      const persona = a.alumno || a.personal;
      return {
        'Fecha': new Date(a.timestamp).toLocaleDateString('es-ES'),
        'Hora': new Date(a.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        'Carnet': persona?.carnet || 'N/A',
        'Nombres': persona?.nombres || '',
        'Apellidos': persona?.apellidos || '',
        'Grado': persona?.grado || 'N/A',
        'Jornada': persona?.jornada || 'N/A',
        'Tipo Persona': a.persona_tipo === 'alumno' ? 'Alumno' : 'Personal',
        'Tipo Evento': a.tipo_evento === 'entrada' ? 'Entrada' : 'Salida',
        'Estado': a.estado_puntualidad?.toUpperCase() || 'N/A',
        'Origen': a.origen,
        'Observaciones': a.observaciones || ''
      };
    });

    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);
    const statsData = [
      { 'Métrica': 'Total de registros', 'Valor': asistencias.length },
      { 'Métrica': 'Entradas', 'Valor': stats.entradas },
      { 'Métrica': 'Salidas', 'Valor': stats.salidas },
      { 'Métrica': 'Puntuales', 'Valor': stats.puntuales },
      { 'Métrica': 'Tardes', 'Valor': stats.tardes },
      { 'Métrica': 'Por QR', 'Valor': stats.porQR },
      { 'Métrica': 'Manual', 'Valor': stats.manual }
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Resumen');

    // Hoja de datos
    const wsData = XLSX.utils.json_to_sheet(datos);
    
    // Ajustar anchos de columna
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 8 },  // Hora
      { wch: 12 }, // Carnet
      { wch: 20 }, // Nombres
      { wch: 20 }, // Apellidos
      { wch: 12 }, // Grado
      { wch: 12 }, // Jornada
      { wch: 12 }, // Tipo Persona
      { wch: 10 }, // Tipo Evento
      { wch: 10 }, // Estado
      { wch: 10 }, // Origen
      { wch: 30 }  // Observaciones
    ];
    wsData['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, wsData, 'Asistencias');

    // Guardar archivo
    const fileName = `reporte_asistencias_${Date.now()}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);
    XLSX.writeFile(wb, filePath);

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
