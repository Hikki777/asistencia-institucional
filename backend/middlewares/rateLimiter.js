const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para endpoints de autenticación
 * Previene ataques de fuerza bruta
 */
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 5 : 1000, // 5 en producción, 1000 en desarrollo
  message: {
    error: 'Demasiados intentos de inicio de sesión',
    detalle: 'Por favor intenta de nuevo en 15 minutos'
  },
  standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  skipSuccessfulRequests: true // No contar requests exitosos
});

/**
 * Rate limiter para endpoints de registro QR
 * Previene spam de escaneos
 */
exports.qrScanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 escaneos por minuto
  message: {
    error: 'Demasiadas solicitudes',
    detalle: 'Por favor espera un momento antes de escanear nuevamente'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para generación de reportes
 * Previene abuso de recursos del servidor
 */
exports.reportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // Máximo 10 reportes por ventana
  message: {
    error: 'Límite de generación de reportes alcanzado',
    detalle: 'Por favor espera 5 minutos antes de generar más reportes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter general para API
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes',
    detalle: 'Has excedido el límite de solicitudes. Intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Excluir rutas específicas del rate limiting general
  skip: (req) => {
    // No limitar health check (considerar mount path)
    const original = req.originalUrl || '';
    const isHealth = original === '/api/health' || req.path === '/health';
    return isHealth;
  }
});

/**
 * Rate limiter para uploads de archivos (fotos, logos)
 */
exports.uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // Máximo 20 uploads por ventana
  message: {
    error: 'Límite de subida de archivos alcanzado',
    detalle: 'Por favor espera 10 minutos antes de subir más archivos'
  },
  standardHeaders: true,
  legacyHeaders: false
});
