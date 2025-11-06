const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware para logging de requests HTTP
 * Agrega request ID y registra todas las peticiones
 */
const requestLogger = (req, res, next) => {
  // Generar ID único para cada request
  req.id = uuidv4();
  
  // Timestamp de inicio
  const startTime = Date.now();

  // Capturar cuando la respuesta se envía
  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    
    const responseTime = Date.now() - startTime;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.socket?.remoteAddress,
      user: req.user ? { id: req.user.id, email: req.user.email, rol: req.user.rol } : undefined
    };

    // Loggear según código de estado
    if (res.statusCode >= 500) {
      logger.error(logData, `❌ ${req.method} ${req.url} - ${res.statusCode}`);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, `⚠️ ${req.method} ${req.url} - ${res.statusCode}`);
    } else if (res.statusCode >= 300) {
      logger.info(logData, `🔄 ${req.method} ${req.url} - ${res.statusCode}`);
    } else {
      logger.info(logData, `✅ ${req.method} ${req.url} - ${res.statusCode}`);
    }

    return res.send(data);
  };

  // Log inicial de la request
  logger.debug({
    requestId: req.id,
    method: req.method,
    url: req.url,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    query: req.query
  }, `📥 Incoming ${req.method} request`);

  next();
};

/**
 * Sanitizar body para no loggear información sensible
 */
function sanitizeBody(body) {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  
  // Lista de campos sensibles a ocultar
  const sensitiveFields = ['password', 'hash_pass', 'token', 'accessToken', 'refreshToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
}

/**
 * Middleware para agregar request ID a headers de respuesta
 */
const attachRequestId = (req, res, next) => {
  if (req.id) {
    res.setHeader('X-Request-Id', req.id);
  }
  next();
};

module.exports = {
  requestLogger,
  attachRequestId
};
