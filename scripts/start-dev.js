const { spawn } = require('child_process');
const net = require('net');
const os = require('os');
const path = require('path');

/**
 * Script optimizado para iniciar backend y frontend
 * - Verifica puertos disponibles
 * - Libera puertos ocupados automáticamente
 * - Inicia servicios en orden correcto
 * - Maneja errores y reintentos
 */

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 5173;
const BACKEND_READY_TIMEOUT = 5000; // 5 segundos

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Verificar si un puerto está libre
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

/**
 * Liberar puerto ocupado (mata el proceso)
 */
async function killProcessOnPort(port) {
  log(`   Liberando puerto ${port}...`, colors.yellow);
  
  try {
    if (os.platform() === 'win32') {
      // Windows: usar netstat y taskkill
      await new Promise((resolve, reject) => {
        const cmd = spawn('powershell', [
          '-Command',
          `$conn = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue; if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }`
        ]);
        
        cmd.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Failed to kill process on port ${port}`));
        });
        
        setTimeout(resolve, 2000); // Timeout de seguridad
      });
    } else {
      // Linux/Mac: usar lsof y kill
      await new Promise((resolve, reject) => {
        const cmd = spawn('sh', ['-c', `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`]);
        cmd.on('close', () => resolve());
        setTimeout(resolve, 2000);
      });
    }
    
    // Esperar a que el puerto se libere
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar que se liberó
    const isFree = await isPortFree(port);
    if (isFree) {
      log(`   [OK] Puerto ${port} liberado`, colors.green);
    } else {
      log(`   [WARN] No se pudo liberar el puerto ${port}`, colors.yellow);
    }
  } catch (error) {
    log(`   [WARN] Error liberando puerto ${port}: ${error.message}`, colors.yellow);
  }
}

/**
 * Verificar que el backend está respondiendo
 */
async function waitForBackend() {
  const maxAttempts = 30;
  const delayMs = 500;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${BACKEND_PORT}/api/health`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Backend returned ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(1000);
      });
      
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return false;
}

/**
 * Iniciar el sistema
 */
async function startDev() {
  log('\n' + '='.repeat(60), colors.bright);
  log('  [SYSTEM] SISTEMA DE ASISTENCIAS - Inicio Optimizado', colors.cyan + colors.bright);
  log('='.repeat(60) + '\n', colors.bright);
  
  // Paso 1: Verificar puertos
  log('[1/4] Verificando puertos...', colors.cyan);
  
  const backendFree = await isPortFree(BACKEND_PORT);
  const frontendFree = await isPortFree(FRONTEND_PORT);
  
  if (!backendFree) {
    log(`   [WARN] Puerto ${BACKEND_PORT} (backend) está ocupado`, colors.yellow);
    await killProcessOnPort(BACKEND_PORT);
  } else {
    log(`   [OK] Puerto ${BACKEND_PORT} (backend) disponible`, colors.green);
  }
  
  if (!frontendFree) {
    log(`   [WARN] Puerto ${FRONTEND_PORT} (frontend) está ocupado`, colors.yellow);
    await killProcessOnPort(FRONTEND_PORT);
  } else {
    log(`   [OK] Puerto ${FRONTEND_PORT} (frontend) disponible`, colors.green);
  }
  
  // Paso 2: Iniciar backend
  log('\n[2/4] Iniciando backend...', colors.cyan);
  
  const backend = spawn('node', ['backend/server.js'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=1024', // Limitar memoria a 1024MB
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    cwd: path.join(__dirname, '..')
  });
  
  backend.on('error', (err) => {
    log(`\n[ERROR] Error al iniciar backend: ${err.message}`, colors.red);
    process.exit(1);
  });
  
  backend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n[ERROR] Backend terminó con código ${code}`, colors.red);
      process.exit(code);
    }
  });
  
  // Paso 3: Esperar a que backend esté listo
  log('   Esperando a que backend esté listo...', colors.yellow);
  
  const backendReady = await waitForBackend();
  
  if (!backendReady) {
    log('\n[ERROR] Backend no respondió en el tiempo esperado', colors.red);
    backend.kill();
    process.exit(1);
  }
  
  log(`   [OK] Backend listo en http://localhost:${BACKEND_PORT}`, colors.green);
  
  // Paso 4: Iniciar frontend
  log('\n[3/4] Iniciando frontend...', colors.cyan);
  
  const frontend = spawn(os.platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../frontend'),
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true
  });
  
  frontend.on('error', (err) => {
    log(`\n[ERROR] Error al iniciar frontend: ${err.message}`, colors.red);
    backend.kill();
    process.exit(1);
  });
  
  frontend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n[ERROR] Frontend terminó con código ${code}`, colors.red);
      backend.kill();
      process.exit(code);
    }
  });
  
  // Esperar un momento para que frontend inicie
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Paso 5: Sistema listo
  log('\n[4/4] Sistema iniciado correctamente\n', colors.cyan);
  log('='.repeat(60), colors.bright);
  log('  [OK] SISTEMA LISTO', colors.green + colors.bright);
  log('='.repeat(60), colors.bright);
  log(`\n[BACKEND] http://localhost:${BACKEND_PORT}`, colors.cyan);
  log(`[FRONTEND] http://localhost:${FRONTEND_PORT}`, colors.cyan);
  log(`\n[INFO] Presiona Ctrl+C para detener el sistema\n`, colors.yellow);
  
  // Manejar señales de terminación
  const cleanup = () => {
    log('\n\n[STOP] Deteniendo servicios...', colors.yellow);
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
    
    setTimeout(() => {
      frontend.kill('SIGKILL');
      backend.kill('SIGKILL');
      process.exit(0);
    }, 2000);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Mantener el proceso vivo
  process.stdin.resume();
}

// Ejecutar
startDev().catch((error) => {
  log(`\n[ERROR] Error fatal: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
