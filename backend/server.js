const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// CORRECCIÓN AUTOMÁTICA DE RUTA DE BD (Absolute Path Fix)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('file:')) {
  // Si es una ruta relativa de SQLite (ej: file:./prisma/dev.db), convertirla a absoluta
  const dbPathRelative = process.env.DATABASE_URL.replace('file:', '').trim();
  if (dbPathRelative.startsWith('./') || dbPathRelative.startsWith('../')) {
    // Asumimos que la ruta es relativa a la RAÍZ del proyecto (donde está package.json)
    // __dirname es backend/, así que la raíz es path.join(__dirname, '..')
    const projectRoot = path.join(__dirname, '..');
    const absoluteDbPath = path.resolve(projectRoot, dbPathRelative);
    process.env.DATABASE_URL = `file:${absoluteDbPath}`;
    console.log(`[DB] Ruta de base de datos corregida a absoluta: ${process.env.DATABASE_URL}`);
  }
}

// Importar logger PRIMERO
const { logger, logSystemStart, setupGlobalErrorHandlers } = require('./utils/logger');
const { requestLogger, attachRequestId } = require('./middlewares/requestLogger');
const { UPLOADS_DIR, FRONTEND_DIR } = require('./utils/paths');

const prisma = require('./prismaClient');
const qrService = require('./services/qrService');

const { apiLimiter } = require('./middlewares/rateLimiter');

// Importar rutas
const qrRoutes = require('./routes/qr');
const usuariosRoutes = require('./routes/usuarios');

const authRoutes = require('./routes/auth');
const alumnosRoutes = require('./routes/alumnos');
const asistenciasRoutes = require('./routes/asistencias');
const docentesRoutes = require('./routes/docentes');
const reportesRoutes = require('./routes/reportes');
const institucionRoutes = require('./routes/institucion');
const metricsRoutes = require('./routes/metrics');
const adminRoutes = require('./routes/admin');

// Verificar variables de entorno críticas
const checkEnv = () => {
  const required = ['JWT_SECRET', 'HMAC_SECRET'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length > 0) {
    logger.fatal({ missing }, '[ERROR] Faltan variables de entorno críticas');
    process.exit(1);
  }
  logger.info({ variables: required }, '[OK] Variables de entorno verificadas');
};

checkEnv();

// Configurar handlers globales de errores
setupGlobalErrorHandlers();

console.log('='.repeat(50));
console.log('  [DEBUG] SERVER CONFIGURATION');
console.log('  UPLOADS_DIR:', UPLOADS_DIR);
console.log('  DATABASE_URL:', process.env.DATABASE_URL);
console.log('='.repeat(50));

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración para Railway/Proxies
app.set('trust proxy', 1);

// ============ MIDDLEWARE DE LOGGING ============

// Request ID y logging (ANTES de otros middlewares)
app.use(attachRequestId);
app.use(requestLogger);

// ============ MIDDLEWARE DE SEGURIDAD ============

// Helmet: Protección de headers HTTP
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitado para permitir inline scripts en HTML
  crossOriginEmbedderPolicy: false
}));

// CORS: Configuración segura
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://sistema-asistencias-30769.web.app',
  'https://sistema-asistencias-30769.firebaseapp.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin, allowedOrigins }, '[CORS] CORS bloqueo origen no permitido');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting general para toda la API
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Detectar errores de JSON malformado (body-parser)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error({ err }, '[JSON ERROR] JSON malformado recibido');
    return res.status(400).json({ error: 'JSON inválido o malformado' });
  }
  next(err);
});

// Servir archivos estáticos (QR, logos, fotos)
app.use('/uploads', express.static(UPLOADS_DIR));

// Servir frontend HTML
app.use(express.static(FRONTEND_DIR));

// Servir qr-mobile.html para celular (SIN LOGO)
app.get('/qr-mobile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../qr-mobile.html'));
});

// Servir qr-mobile-con-logo.html para celular (CON LOGO)
app.get('/qr-mobile-con-logo.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../qr-mobile-con-logo.html'));
});

// Servir imprimir-qr.html para imprimir QR codes
app.get('/imprimir-qr.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../imprimir-qr.html'));
});

// Servir test-qr-display.html para pruebas
app.get('/test-qr-display.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-qr-display.html'));
});

// Nota: La inicialización de directorios se realiza dentro de iniciar()
// para garantizar el orden correcto del startup y el manejo de errores.

// ============ RUTAS PÚBLICAS (sin protección inicialmente para desarrollo) ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Fallback root route (para que Railway Health Check en '/' no falle)
app.get('/', (req, res, next) => {
  // Si existe el frontend, express.static lo servirá antes.
  // Si no, respondemos esto para evitar 404 y que Railway no mate el servicio.
  res.send('Backend de Sistema de Asistencia Institucional - Funcionando [READY]');
});

// ============ RUTAS DE INICIALIZACIÓN ============
// (Las rutas de institución se manejan en routes/institucion.js)

// ============ RUTAS ESPECÍFICAS MONTADAS ============

const excusasRoutes = require('./routes/excusas');
app.use('/api/qr', qrRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/institucion', institucionRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/excusas', excusasRoutes);
app.use('/api/admin', adminRoutes);



// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  logger.error({ 
    err, 
    requestId: req.id,
    url: req.url,
    method: req.method
  }, '[ERROR] Error no capturado en la aplicacion');
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Ha ocurrido un error interno' : err.message,
    requestId: req.id
  });
});

// ============ INICIAR SERVIDOR ============

async function iniciar() {
  try {
    // Conectar BD
    console.log('\n\n🔍 --- DEBUG MODE: BACKEND RELOADED SUCCESSFULLY --- 🔍\n');
    logger.info('[DB] Probando conexion a base de datos...');
    
    // DEBUG: Verificar formato de URL (sin revelar credenciales)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.length > 15 ? `${dbUrl.substring(0, 15)}...` : 'TOO_SHORT';
    logger.info({ urlPrefix: maskedUrl, length: dbUrl.length }, '[DEBUG] Debug DATABASE_URL');

    await prisma.$queryRaw`SELECT 1`;
    logger.info('[OK] Base de datos conectada correctamente');



    // Iniciar servidor con Promise
    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        logSystemStart({
          port: PORT,
          databaseUrl: process.env.DATABASE_URL
        });
        
        logger.info(`[API] Health: http://localhost:${PORT}/api/health`);
        logger.info(`[API] Docs: http://localhost:${PORT}/api-docs`);
        
        resolve(server);
      });
      
      server.on('error', (err) => {
        logger.fatal({ err }, '[FATAL] Error al iniciar servidor');
        reject(err);
      });
    });
  } catch (error) {
    logger.fatal({ err: error }, '[FATAL] Error critico durante el inicio');
    process.exit(1);
  }
}

iniciar().catch(err => {
  logger.fatal({ err }, '[FATAL] Fallo al iniciar el servidor');
  process.exit(1);
});

// Manejar salida limpia
process.on('SIGINT', async () => {
  console.log('\n\n[Server] Received SIGINT, closing gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n[Server] Received SIGTERM, closing gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
