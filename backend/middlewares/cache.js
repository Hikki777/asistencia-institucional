/**
 * Middleware de caché en memoria
 * Cache simple basado en Map con TTL configurable
 */

const { logger } = require('../utils/logger');

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttlDefaults = {
      institucion: 60 * 60 * 1000, // 1 hora (cambia raramente)
      stats: 5 * 60 * 1000,         // 5 minutos (stats diarias)
      list: 2 * 60 * 1000,          // 2 minutos (listados)
      default: 60 * 1000            // 1 minuto
    };
  }

  /**
   * Generar clave de caché desde request
   */
  generateKey(req) {
    const { baseUrl = '', path = '', query = {} } = req;
    // Usar baseUrl + path para tener la ruta completa montada (e.g., /api/asistencias/hoy)
    const fullPath = `${baseUrl}${path}` || req.originalUrl?.split('?')[0] || path;
    const queryString = Object.keys(query)
      .sort()
      .map(k => `${k}=${query[k]}`)
      .join('&');
    return queryString ? `${fullPath}?${queryString}` : fullPath;
  }

  /**
   * Obtener valor del caché
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Verificar expiración
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      logger.debug({ key }, '[CACHE] Cache expirado y eliminado');
      return null;
    }

    logger.debug({ key, age: Date.now() - item.timestamp }, '[CACHE] Cache hit');
    return item.data;
  }

  /**
   * Guardar valor en caché
   */
  set(key, data, ttl = this.ttlDefaults.default) {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    this.cache.set(key, item);
    logger.debug({ key, ttl, size: this.cache.size }, '[CACHE] Valor guardado en cache');
  }

  /**
   * Invalidar caché por patrón
   */
  invalidate(pattern) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.info({ pattern, count }, '[CACHE] Cache invalidado por patrón');
    return count;
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info({ size }, '[CACHE] Cache completamente limpiado');
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired
    };
  }

  /**
   * Limpieza automática de caché expirado
   */
  cleanup() {
    const before = this.cache.size;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }

    const cleaned = before - this.cache.size;
    if (cleaned > 0) {
      logger.debug({ cleaned, remaining: this.cache.size }, '[CLEANUP] Limpieza automática de cache');
    }
  }
}

// Singleton
const cacheManager = new CacheManager();

// Limpieza automática cada 10 minutos
setInterval(() => {
  cacheManager.cleanup();
}, 10 * 60 * 1000);

/**
 * Middleware para cachear respuestas GET
 * Uso: router.get('/ruta', cacheMiddleware('stats'), handler)
 */
function cacheMiddleware(ttlType = 'default') {
  return (req, res, next) => {
    // Solo cachear GET
    if (req.method !== 'GET') {
      return next();
    }

    const key = cacheManager.generateKey(req);
    const cached = cacheManager.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Interceptar res.json para guardar en caché
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      const ttl = cacheManager.ttlDefaults[ttlType] || cacheManager.ttlDefaults.default;
      cacheManager.set(key, data, ttl);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Middleware para invalidar caché después de mutaciones
 * Uso: router.post('/ruta', invalidateCacheMiddleware('/api/alumnos'), handler)
 */
function invalidateCacheMiddleware(pattern) {
  return (req, res, next) => {
    // Ejecutar después de la respuesta
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheManager.invalidate(pattern);
      }
    });
    next();
  };
}

module.exports = {
  cacheManager,
  cacheMiddleware,
  invalidateCacheMiddleware
};
