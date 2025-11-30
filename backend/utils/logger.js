const pino = require('pino');
const path = require('path');

/**
 * Configuración de Logger con Pino
 * 
 * Características:
 * - Logs estructurados en JSON
 * - Niveles: trace, debug, info, warn, error, fatal
 * - Pretty printing en desarrollo
 * - Rotación automática de archivos
 * - Request IDs para rastreo
 * - Performance optimizado
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';
const noEmojiEnv = process.env.NO_EMOJI;
const NO_EMOJI = !!(noEmojiEnv && (noEmojiEnv === '1' || noEmojiEnv === 'true'));

// Remueve la mayoría de emojis y símbolos pictográficos, dejando acentos y letras normales
const stripEmojis = (s) => {
  if (!s || !NO_EMOJI) return s;
  try {
    return s
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')   // Emoji range principal
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')   // Suplemento
      .replace(/[\u2600-\u26FF]/g, '')          // Misceláneos
      .replace(/[\u2700-\u27BF]/g, '')          // Dingbats
      .replace(/\uFE0F/g, '')                    // Variation Selector-16
      .trim();
  } catch {
    return s;
  }
};

const stripEmojisDeep = (obj) => {
  if (!NO_EMOJI) return obj;
  if (obj == null) return obj;
  if (typeof obj === 'string') return stripEmojis(obj);
  if (Array.isArray(obj)) return obj.map(stripEmojisDeep);
  if (typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      out[k] = stripEmojisDeep(obj[k]);
    }
    return out;
  }
  return obj;
};

// Configuración de transporte para desarrollo (pretty print)
const developmentTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss dd/mm/yyyy',
    ignore: 'pid,hostname',
    singleLine: false,
    levelFirst: true,
    messageFormat: '{levelLabel} - {msg}'
  }
};

// Configuración de transporte para producción (archivos + console)
const productionTransports = [
  // Console output en JSON
  {
    target: 'pino/file',
    options: { destination: 1 } // stdout
  },
  // Archivo de logs generales
  {
    target: 'pino/file',
    options: { 
      destination: path.join(__dirname, '../../logs/app.log'),
      mkdir: true
    }
  },
  // Archivo solo de errores
  {
    target: 'pino/file',
    level: 'error',
    options: { 
      destination: path.join(__dirname, '../../logs/error.log'),
      mkdir: true
    }
  }
];

// Configuración base de Pino
const pinoConfig = {
  level: isTest ? 'silent' : (process.env.LOG_LEVEL || 'info'),
  
  // Formato de timestamp
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  
  // Campos base en cada log
  base: {
    env: process.env.NODE_ENV || 'development',
    app: 'asistencia-institucional'
  },
  
  // Formateadores para ajustar salida
  formatters: {
    // level(label) {
    //   return { level: label };
    // },
    log(object) {
      if (!NO_EMOJI) return object;
      const out = stripEmojisDeep(object);
      return out;
    }
  },
  
  // Serializers personalizados
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
      userAgent: req.headers['user-agent']
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      responseTime: res.responseTime
    }),
    err: pino.stdSerializers.err
  },
  
  // Transporte según ambiente
  transport: isDevelopment ? developmentTransport : { targets: productionTransports }
};

// Crear instancia del logger
const logger = pino(pinoConfig);

/**
 * Wrapper para agregar contexto adicional a los logs
 */
const createChildLogger = (context) => {
  return logger.child(context);
};

/**
 * Helper para loggear errores de Prisma
 */
const logPrismaError = (error, context = {}) => {
  logger.error({
    err: error,
    prismaCode: error.code,
    prismaMessage: error.message,
    prismaTarget: error.meta?.target,
    ...context
  }, 'Prisma Database Error');
};

/**
 * Helper para loggear requests HTTP (alternativa a pino-http)
 */
const logRequest = (req, res, responseTime) => {
  const logData = {
    req,
    res: { statusCode: res.statusCode, responseTime },
    user: req.user ? { id: req.user.id, email: req.user.email } : undefined
  };

  if (res.statusCode >= 500) {
    logger.error(logData, 'HTTP Request Error');
  } else if (res.statusCode >= 400) {
    logger.warn(logData, 'HTTP Request Warning');
  } else {
    logger.info(logData, 'HTTP Request');
  }
};

/**
 * Helper para logs de inicio de sistema
 */
const logSystemStart = (config) => {
  logger.info({
    port: config.port,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    database: config.databaseUrl ? '✓ Connected' : '✗ Not configured'
  }, '🚀 Sistema iniciado correctamente');
};

/**
 * Helper para logs de errores no capturados
 */
const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, '💥 Uncaught Exception - El proceso se detendrá');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error({
      err: reason,
      promise: promise
    }, '⚠️ Unhandled Promise Rejection');
  });

  process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM recibido, cerrando servidor gracefully...');
  });

  process.on('SIGINT', () => {
    logger.info('👋 SIGINT recibido, cerrando servidor...');
  });
};

module.exports = {
  logger,
  createChildLogger,
  logPrismaError,
  logRequest,
  logSystemStart,
  setupGlobalErrorHandlers
};
