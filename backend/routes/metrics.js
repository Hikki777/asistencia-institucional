const express = require('express');
const prisma = require('../prismaClient');
const { verifyJWT } = require('../middlewares/auth');
const { logger } = require('../utils/logger');
const { cacheManager } = require('../middlewares/cache');

const router = express.Router();

// Contadores de métricas en memoria (se resetean al reiniciar)
const metrics = {
  startTime: Date.now(),
  requests: {
    total: 0,
    byEndpoint: {},
    byStatus: { '2xx': 0, '4xx': 0, '5xx': 0 }
  },
  database: {
    queries: 0,
    errors: 0
  },
  cache: {
    hits: 0,
    misses: 0,
    size: 0
  }
};

/**
 * GET /api/metrics
 * Obtener métricas básicas del sistema
 */
router.get('/', async (req, res) => {
  try {
    const uptime = Date.now() - metrics.startTime;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);

    // Stats de caché
    const cacheStats = cacheManager.getStats();
    metrics.cache.size = cacheStats.total;

    // Stats de BD
    const [
      totalAlumnos,
      totalPersonal,
      totalAsistenciasHoy,
      totalQRs
    ] = await Promise.all([
      prisma.alumno.count({ where: { estado: 'activo' } }),
      prisma.personal.count({ where: { estado: 'activo' } }),
      prisma.asistencia.count({
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.codigoQr.count({ where: { vigente: true } })
    ]);

    res.json({
      uptime: {
        ms: uptime,
        hours: uptimeHours,
        startedAt: new Date(metrics.startTime).toISOString()
      },
      requests: {
        total: metrics.requests.total,
        byStatus: metrics.requests.byStatus,
        topEndpoints: Object.entries(metrics.requests.byEndpoint)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([path, count]) => ({ path, count }))
      },
      database: {
        alumnos: totalAlumnos,
        personal: totalPersonal,
        asistenciasHoy: totalAsistenciasHoy,
        qrsVigentes: totalQRs,
        queries: metrics.database.queries,
        errors: metrics.database.errors
      },
      cache: {
        size: metrics.cache.size,
        active: cacheStats.active,
        expired: cacheStats.expired,
        hitRate: metrics.cache.hits + metrics.cache.misses > 0
          ? ((metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100).toFixed(2) + '%'
          : 'N/A'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: {
          heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + ' MB',
          rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + ' MB'
        }
      }
    });

    logger.debug({ userId: req.user?.id }, 'Métricas consultadas');
  } catch (error) {
    logger.error({ err: error }, 'Error obteniendo métricas');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/metrics/reset
 * Resetear contadores (solo admin)
 */
router.post('/reset', verifyJWT, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden resetear métricas' });
    }

    metrics.requests.total = 0;
    metrics.requests.byEndpoint = {};
    metrics.requests.byStatus = { '2xx': 0, '4xx': 0, '5xx': 0 };
    metrics.database.queries = 0;
    metrics.database.errors = 0;
    metrics.cache.hits = 0;
    metrics.cache.misses = 0;
    metrics.startTime = Date.now();

    logger.info({ userId: req.user.id }, 'Métricas reseteadas por admin');
    res.json({ success: true, message: 'Métricas reseteadas' });
  } catch (error) {
    logger.error({ err: error }, 'Error reseteando métricas');
    res.status(500).json({ error: error.message });
  }
});

// Función para incrementar contadores (puede llamarse desde middlewares)
function incrementMetric(type, key, value = 1) {
  if (type === 'request') {
    metrics.requests.total += value;
    metrics.requests.byEndpoint[key] = (metrics.requests.byEndpoint[key] || 0) + value;
  } else if (type === 'status') {
    const statusGroup = key >= 200 && key < 300 ? '2xx'
      : key >= 400 && key < 500 ? '4xx'
      : key >= 500 ? '5xx' : null;
    if (statusGroup) {
      metrics.requests.byStatus[statusGroup] += value;
    }
  } else if (type === 'db') {
    if (key === 'query') metrics.database.queries += value;
    if (key === 'error') metrics.database.errors += value;
  } else if (type === 'cache') {
    if (key === 'hit') metrics.cache.hits += value;
    if (key === 'miss') metrics.cache.misses += value;
  }
}

module.exports = router;
module.exports.incrementMetric = incrementMetric;
module.exports.metrics = metrics;
