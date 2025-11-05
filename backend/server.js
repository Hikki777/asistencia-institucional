const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const prisma = require('./prismaClient');
const qrService = require('./services/qrService');
const backupService = require('./services/backupService');
const diagnosticsService = require('./services/diagnosticsService');
const scheduler = require('./jobs/scheduler');

// Importar rutas
const qrRoutes = require('./routes/qr');
const repairRoutes = require('./routes/repair');
const authRoutes = require('./routes/auth');
const alumnosRoutes = require('./routes/alumnos');
const asistenciasRoutes = require('./routes/asistencias');
const docentesRoutes = require('./routes/docentes');

// Verificar variables de entorno críticas
const checkEnv = () => {
  const required = ['JWT_SECRET', 'HMAC_SECRET'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
  }
};

checkEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos (QR, logos, fotos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir frontend HTML
app.use(express.static(path.join(__dirname, '../frontend')));

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

// ============ RUTAS DE INICIALIZACIÓN ============

// Inicializar institución (primera ejecución)
app.post('/api/institucion/init', async (req, res) => {
  try {
    const { nombre, horario_inicio, margen_puntualidad_min, logo_base64, admin_email, admin_password } = req.body;

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
        margen_puntualidad_min: margen_puntualidad_min || 5,
        inicializado: true
      },
      update: {
        nombre,
        logo_base64,
        logo_path: logoResult.relativePath,
        horario_inicio: horario_inicio || '07:00',
        margen_puntualidad_min: margen_puntualidad_min || 5,
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

    console.log(`✅ Institución inicializada: ${nombre}`);
    return res.status(201).json({
      success: true,
      institucion,
      admin: { email: admin.email, rol: admin.rol },
      message: 'Institución y admin creados exitosamente'
    });
  } catch (error) {
    console.error('[POST /api/institucion/init]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Obtener datos de institución
app.get('/api/institucion', async (req, res) => {
  try {
    const institucion = await prisma.institucion.findUnique({
      where: { id: 1 },
      select: {
        id: true,
        nombre: true,
        logo_path: true,
        horario_inicio: true,
        margen_puntualidad_min: true,
        inicializado: true,
        creado_en: true
      }
    });

    if (!institucion) {
      return res.status(404).json({ error: 'Institución no inicializada' });
    }

    res.json(institucion);
  } catch (error) {
    console.error('[GET /api/institucion]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/institucion - Actualizar datos institucionales
app.put('/api/institucion', async (req, res) => {
  try {
    const { nombre, horario_inicio, margen_puntualidad_min, logo_base64 } = req.body;

    const institucion = await prisma.institucion.findUnique({ where: { id: 1 } });
    if (!institucion) {
      return res.status(404).json({ error: 'Institución no inicializada' });
    }

    const updateData = {
      nombre: nombre || institucion.nombre,
      horario_inicio: horario_inicio !== undefined ? horario_inicio : institucion.horario_inicio,
      margen_puntualidad_min: margen_puntualidad_min !== undefined ? parseInt(margen_puntualidad_min) : institucion.margen_puntualidad_min
    };

    // Si hay nuevo logo, guardarlo y regenerar QRs
    if (logo_base64) {
      const logoResult = await qrService.guardarLogo(logo_base64, 'logo.png');
      if (logoResult) {
        updateData.logo_base64 = logo_base64;
        updateData.logo_path = logoResult.relativePath;

        // Regenerar todos los QRs con el nuevo logo
        console.log('🔄 Regenerando QRs con nuevo logo...');
        const qrs = await prisma.codigoQr.findMany({
          include: { alumno: true, personal: true }
        });

        for (const qr of qrs) {
          const persona = qr.alumno || qr.personal;
          if (persona) {
            const { absolutePath, relativePath } = qrService.obtenerRutasQr(qr.persona_tipo, persona.carnet);
            await qrService.generarQrConLogo(qr.token, logo_base64, absolutePath);
            await prisma.codigoQr.update({
              where: { id: qr.id },
              data: { png_path: relativePath, regenerado_en: new Date() }
            });
          }
        }
        console.log(`✅ ${qrs.length} QRs regenerados con nuevo logo`);
      }
    }

    const institucionActualizada = await prisma.institucion.update({
      where: { id: 1 },
      data: updateData
    });

    console.log('✅ Institución actualizada');
    res.json(institucionActualizada);
  } catch (error) {
    console.error('[PUT /api/institucion]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============ RUTAS ESPECÍFICAS MONTADAS ============

app.use('/api/qr', qrRoutes);
app.use('/api/repair', repairRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/docentes', docentesRoutes);

// ============ RUTA DE DIAGNÓSTICO ============

/**
 * GET /api/diagnostics/qrs
 * Ejecutar diagnóstico de QR
 */
app.get('/api/diagnostics/qrs', async (req, res) => {
  try {
    console.log('[GET /api/diagnostics/qrs] Diagnostic triggered');
    const resultado = await diagnosticsService.ejecutarDiagnosticos();
    
    // Registrar en auditoria
    await diagnosticsService.registrarDiagnostico(null, resultado);
    
    res.json(resultado);
  } catch (error) {
    console.error('[GET /api/diagnostics/qrs]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('[ErrorHandler]', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ============ INICIAR SERVIDOR ============

async function iniciar() {
  try {
    // Conectar BD
    console.log('[Startup] Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    // Inicializar directorios y backups
    console.log('[Startup] Initializing backups...');
    await backupService.inicializarBackups();
    
    console.log('[Startup] Initializing QR directories...');
    await qrService.inicializarDirectorios();
    console.log('✅ Directories initialized');

    // Iniciar scheduler
    console.log('[Startup] Starting scheduler...');
    scheduler.iniciar();
    console.log('✅ Scheduler started');

    // Iniciar servidor con Promise
    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
        console.log(`📝 Documentación: http://localhost:${PORT}/api-docs`);
        console.log(`[Startup] Server ready and listening on 0.0.0.0:${PORT}`);
        resolve(server);
      });
      
      server.on('error', (err) => {
        console.error('❌ Server listen error:', err.message);
        reject(err);
      });
    });
  } catch (error) {
    console.error('❌ Startup error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

iniciar().catch(err => {
  console.error('❌ Failed to start server:', err);
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
