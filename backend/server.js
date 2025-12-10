const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// CORRECCIÓN AUTOMÁTICA: Si el usuario pegó "DATABASE_URL=..." en el valor
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('DATABASE_URL=')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('DATABASE_URL=', '');
  console.log('⚠️ Se corrigió automáticamente la variable DATABASE_URL malformada');
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
    logger.fatal({ missing }, '❌ Faltan variables de entorno críticas');
    process.exit(1);
  }
  logger.info({ variables: required }, '✅ Variables de entorno verificadas');
};

checkEnv();

// Configurar handlers globales de errores
setupGlobalErrorHandlers();

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
      logger.warn({ origin, allowedOrigins }, '⚠️ CORS bloqueó origen no permitido');
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

// Servir archivos estáticos (QR, logos, fotos)
// Servir archivos estáticos (QR, logos, fotos) - REMOVIDO: Se usa Cloudinary
// app.use('/uploads', express.static(UPLOADS_DIR));

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
  res.send('Backend de Sistema de Asistencia Institucional - Funcionando 🚀');
});

// ============ RUTAS DE INICIALIZACIÓN ============

// Importar validaciones para institución
const { validarInicializarInstitucion, validarActualizarInstitucion } = require('./middlewares/validation');

// Inicializar institución (primera ejecución)
app.post('/api/institucion/init', validarInicializarInstitucion, async (req, res) => {
  try {
    const { nombre, horario_inicio, horario_salida, margen_puntualidad_min, logo_base64, admin_email, admin_password, direccion, email, telefono } = req.body;

    if (!nombre || !logo_base64 || !admin_email || !admin_password) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: nombre, logo_base64, admin_email, admin_password'
      });
    }

    // Verificar si ya está inicializado
    const existing = await prisma.institucion.findUnique({ where: { id: 1 } }).catch(() => null);
    if (existing && existing.inicializado) {
      return res.status(400).json({ error: 'La institución ya está inicializada' });
    }

    // Guardar logo
    const logoResult = await qrService.guardarLogo(logo_base64, 'logo.png');
    if (!logoResult) {
      return res.status(500).json({ error: 'Error guardando logo' });
    }

    // Crear o actualizar institución
    const institucion = await prisma.institucion.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        nombre,
        logo_base64,
        logo_path: logoResult.relativePath,
        horario_inicio: horario_inicio || '07:00',
        horario_salida: horario_salida || '13:00',
        margen_puntualidad_min: margen_puntualidad_min || 5,
        direccion,
        email,
        telefono,
        inicializado: true
      },
      update: {
        nombre,
        logo_base64,
        logo_path: logoResult.relativePath,
        horario_inicio: horario_inicio || '07:00',
        horario_salida: horario_salida || '13:00',
        margen_puntualidad_min: margen_puntualidad_min || 5,
        direccion,
        email,
        telefono,
        inicializado: true
      }
    });

    // Crear admin inicial
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(admin_password, 10);
    
    const admin = await prisma.usuario.create({
      data: {
        email: admin_email,
        hash_pass: hash,
        rol: 'admin',
        activo: true
      },
      select: { id: true, email: true, rol: true }
    });

    // Registrar en auditoria
    await prisma.auditoria.create({
      data: {
        entidad: 'Institucion',
        entidad_id: 1,
        usuario_id: admin.id,
        accion: 'crear',
        detalle: JSON.stringify({ tipo: 'initialization', nombre })
      }
    });

    logger.info({ institucion: nombre, adminEmail: admin.email }, '✅ Institución inicializada exitosamente');
    return res.status(201).json({
      success: true,
      institucion,
      admin: { email: admin.email, rol: admin.rol },
      message: 'Institución y admin creados exitosamente'
    });
  } catch (error) {
    logger.error({ err: error, body: req.body }, '❌ Error al inicializar institución');
    res.status(500).json({ error: error.message });
  }
});

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
  }, '❌ Error no capturado en la aplicación');
  
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
    logger.info('🔌 Probando conexión a base de datos...');
    
    // DEBUG: Verificar formato de URL (sin revelar credenciales)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.length > 15 ? `${dbUrl.substring(0, 15)}...` : 'TOO_SHORT';
    logger.info({ urlPrefix: maskedUrl, length: dbUrl.length }, '🔍 Debug DATABASE_URL');

    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Base de datos conectada correctamente');



    // Iniciar servidor con Promise
    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        logSystemStart({
          port: PORT,
          databaseUrl: process.env.DATABASE_URL
        });
        
        logger.info(`📋 API Health: http://localhost:${PORT}/api/health`);
        logger.info(`📝 API Docs: http://localhost:${PORT}/api-docs`);
        
        resolve(server);
      });
      
      server.on('error', (err) => {
        logger.fatal({ err }, '❌ Error al iniciar servidor');
        reject(err);
      });
    });
  } catch (error) {
    logger.fatal({ err: error }, '❌ Error crítico durante el inicio');
    process.exit(1);
  }
}

iniciar().catch(err => {
  logger.fatal({ err }, '❌ Fallo al iniciar el servidor');
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
