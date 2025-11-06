const PDFDocument = require('pdfkit');
require('pdfkit-table'); // Extiende PDFDocument
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
    
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 50, { width: 60, height: 60 });
        console.log('✅ Logo agregado al PDF');
      } catch (error) {
        console.log('⚠️ No se pudo cargar el logo:', error.message);
      }
    } else {
      console.log('ℹ️ No se encontró logo institucional');
    }

    // Encabezado institucional (con espacio para logo)
    doc.fontSize(18).font('Helvetica-Bold').text(institucion?.nombre || 'Instituto Educativo', 130, 55, { align: 'left' });
    if (institucion?.direccion) {
      doc.fontSize(10).font('Helvetica').text(institucion.direccion, 130, 75, { align: 'left' });
    }
    if (institucion?.telefono) {
      doc.text(`Tel: ${institucion.telefono}`, 130, 90, { align: 'left' });
    }
    
    // Resetear posición y continuar
    doc.moveDown(3);
    doc.fontSize(14).font('Helvetica-Bold').text('REPORTE DE ASISTENCIAS', { align: 'center' });
    doc.moveDown();

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

    // Tabla de datos
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
      
      // Usar pdfkit-table para crear la tabla
      doc.table(tableData, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font('Helvetica').fontSize(8);
        }
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
   * Generar reporte de asistencias en Excel
   */
  async generarReporteExcel(filtros = {}) {
    const { fechaInicio, fechaFin, personaTipo, grado, tipoEvento } = filtros;
    const where = this.construirFiltros(filtros);

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

    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);

    // ===== HOJA 1: PORTADA E INFORMACIÓN =====
    const infoData = [
      ['REPORTE DE ASISTENCIAS'],
      [''],
      ['Institución:', institucion?.nombre || 'Instituto Educativo'],
      ['Dirección:', institucion?.direccion || 'N/A'],
      ['Teléfono:', institucion?.telefono || 'N/A'],
      [''],
      ['INFORMACIÓN DEL REPORTE'],
      ['Fecha de generación:', new Date().toLocaleString('es-ES')],
      ['Generado por:', 'Sistema de Registro Institucional'],
      [''],
      ['FILTROS APLICADOS'],
      ['Fecha inicio:', fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES') : 'No especificado'],
      ['Fecha fin:', fechaFin ? new Date(fechaFin).toLocaleDateString('es-ES') : 'No especificado'],
      ['Tipo de persona:', personaTipo ? (personaTipo === 'alumno' ? 'Alumnos' : 'Personal') : 'Todos'],
      ['Grado:', grado || 'Todos'],
      ['Tipo de evento:', tipoEvento ? (tipoEvento === 'entrada' ? 'Entradas' : 'Salidas') : 'Todos'],
      [''],
      ['RESUMEN ESTADÍSTICO'],
      ['Total de registros:', asistencias.length],
      ['Entradas:', stats.entradas],
      ['Salidas:', stats.salidas],
      ['Puntuales:', stats.puntuales],
      ['Tardíos:', stats.tardes],
      ['Registros por QR:', stats.porQR],
      ['Registros manuales:', stats.manual]
    ];

    // ===== HOJA 2: DATOS DETALLADOS =====
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

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Agregar Hoja 1: Información y Resumen
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    
    // Estilos para la hoja de información (ancho de columnas)
    wsInfo['!cols'] = [
      { wch: 25 }, // Columna A (etiquetas)
      { wch: 50 }  // Columna B (valores)
    ];

    // Fusionar celdas para el título
    if (!wsInfo['!merges']) wsInfo['!merges'] = [];
    wsInfo['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }); // Título

    XLSX.utils.book_append_sheet(wb, wsInfo, 'Información');

    // Agregar Hoja 2: Datos detallados
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
