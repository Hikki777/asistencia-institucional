const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyJWT } = require('../middlewares/auth');

const prisma = new PrismaClient();

// Todas las rutas requieren autenticación
router.use(verifyJWT);

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas completas para el dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    // Obtener todos los alumnos con sus datos
    const alumnos = await prisma.alumno.findMany({
      select: {
        id: true,
        grado: true,
        nivel: true,
        sexo: true,
        activo: true,
      }
    });

    // Estadísticas por nivel académico
    const porNivel = {
      primaria: alumnos.filter(a => a.nivel === 'Primaria' && a.activo).length,
      basicos: alumnos.filter(a => a.nivel === 'Básicos' && a.activo).length,
      diversificado: alumnos.filter(a => a.nivel === 'Diversificado' && a.activo).length,
    };

    // Estadísticas por grado
    const gradosUnicos = [...new Set(alumnos.filter(a => a.activo).map(a => a.grado))].sort();
    const porGrado = {};
    gradosUnicos.forEach(grado => {
      porGrado[grado] = alumnos.filter(a => a.grado === grado && a.activo).length;
    });

    // Estadísticas por sexo
    const porSexo = {
      masculino: alumnos.filter(a => a.sexo === 'M' && a.activo).length,
      femenino: alumnos.filter(a => a.sexo === 'F' && a.activo).length,
    };

    // Totales
    const totales = {
      activos: alumnos.filter(a => a.activo).length,
      inactivos: alumnos.filter(a => !a.activo).length,
      total: alumnos.length,
    };

    // Obtener personal
    const personal = await prisma.personal.count();

    // Obtener asistencias del día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const asistenciasHoy = await prisma.asistencia.count({
      where: {
        timestamp: {
          gte: hoy,
          lt: manana,
        }
      }
    });

    // QRs generados
    const qrsGenerados = await prisma.qRCode.count();

    // Excusas pendientes
    const excusasPendientes = await prisma.excusa.count({
      where: {
        estado: 'pendiente'
      }
    });

    // Tendencia semanal (últimos 7 días)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    const asistenciasSemana = await prisma.asistencia.findMany({
      where: {
        timestamp: {
          gte: hace7Dias
        }
      },
      select: {
        timestamp: true,
        tipo_evento: true,
      }
    });

    // Agrupar por día
    const tendenciaSemanal = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      
      const siguienteDia = new Date(fecha);
      siguienteDia.setDate(siguienteDia.getDate() + 1);
      
      const count = asistenciasSemana.filter(a => {
        const timestamp = new Date(a.timestamp);
        return timestamp >= fecha && timestamp < siguienteDia;
      }).length;
      
      tendenciaSemanal.push({
        fecha: fecha.toISOString().split('T')[0],
        asistencias: count
      });
    }

    // Tasa de asistencia promedio (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const asistencias30Dias = await prisma.asistencia.count({
      where: {
        timestamp: {
          gte: hace30Dias
        },
        tipo_evento: 'entrada'
      }
    });

    const diasHabiles = 22; // Aproximado
    const alumnosActivos = totales.activos;
    const tasaAsistencia = alumnosActivos > 0 
      ? ((asistencias30Dias / (alumnosActivos * diasHabiles)) * 100).toFixed(1)
      : 0;

    res.json({
      porNivel,
      porGrado,
      porSexo,
      totales,
      personal,
      asistenciasHoy,
      qrsGenerados,
      excusasPendientes,
      tendenciaSemanal,
      tasaAsistencia: parseFloat(tasaAsistencia)
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

/**
 * GET /api/dashboard/top-grados
 * Obtiene los top 5 grados con mejor asistencia
 */
router.get('/top-grados', async (req, res) => {
  try {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Obtener todos los alumnos activos con sus asistencias
    const alumnos = await prisma.alumno.findMany({
      where: { activo: true },
      select: {
        grado: true,
        asistencias: {
          where: {
            timestamp: { gte: hace30Dias },
            tipo_evento: 'entrada'
          }
        }
      }
    });

    // Agrupar por grado
    const gradosMap = {};
    alumnos.forEach(alumno => {
      if (!gradosMap[alumno.grado]) {
        gradosMap[alumno.grado] = {
          grado: alumno.grado,
          totalAlumnos: 0,
          totalAsistencias: 0
        };
      }
      gradosMap[alumno.grado].totalAlumnos++;
      gradosMap[alumno.grado].totalAsistencias += alumno.asistencias.length;
    });

    // Calcular porcentaje y ordenar
    const gradosArray = Object.values(gradosMap).map(g => ({
      grado: g.grado,
      porcentaje: g.totalAlumnos > 0 
        ? ((g.totalAsistencias / (g.totalAlumnos * 22)) * 100).toFixed(1)
        : 0,
      alumnos: g.totalAlumnos
    })).sort((a, b) => parseFloat(b.porcentaje) - parseFloat(a.porcentaje));

    // Top 5
    const top5 = gradosArray.slice(0, 5);

    res.json({ topGrados: top5 });

  } catch (error) {
    console.error('Error obteniendo top grados:', error);
    res.status(500).json({ error: 'Error al obtener top grados' });
  }
});

module.exports = router;
