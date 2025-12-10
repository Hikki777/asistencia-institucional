const prisma = require('../prismaClient');
const { logger } = require('../utils/logger');

class ReportService {
  /**
   * Obtener datos para el reporte (para generar en Frontend)
   */
  async obtenerDatosReporte(filtros = {}) {
    const { fechaInicio, fechaFin, personaTipo, grado, tipoEvento } = filtros;

    logger.info({ filtros }, '📄 Obteniendo datos para reporte');
    
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
            cargo: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Obtener institución
    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    
    // Estadísticas
    const stats = this.calcularEstadisticas(asistencias);

    logger.info({ count: asistencias.length }, `✅ Datos obtenidos exitosamente`);

    return { 
      asistencias, 
      institucion, 
      stats, 
      filtrosGenerated: {
        fechaInicio,
        fechaFin,
        personaTipo,
        grado
      }
    };
  }

  /**
   * Alias detallado para compatibilidad
   */
  async generarReportePDF(filtros = {}) {
    return this.obtenerDatosReporte(filtros);
  }

  /**
   * Alias detallado para compatibilidad
   */
  async generarReporteExcel(filtros = {}) {
    return this.obtenerDatosReporte(filtros);
  }

  /**
   * Obtener datos por alumno específico
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

    return this.obtenerDatosReporte(filtros);
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
      where.alumno = { grado: filtros.grado };
    }

    return where;
  }

  /**
   * Calcular estadísticas
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

  // Deprecated cleanup
  async limpiarArchivosTemporales() {}
}

module.exports = new ReportService();
