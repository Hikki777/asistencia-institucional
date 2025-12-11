/**
 * Setup script para base de datos de pruebas
 * Ejecutado automáticamente antes de los tests (pretest hook)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

async function setupTestDB() {
  try {
    console.log('[SETUP] Configurando base de datos de pruebas...');

    // Verificar que existe la base de datos
    const dbPath = path.join(__dirname, 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath)) {
      console.log('[WARN] Base de datos no encontrada, creando...');
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'development' }
      });
    }

    // Verificar que el cliente de Prisma existe
    const clientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
    if (!fs.existsSync(clientPath)) {
      console.log('[INFO] Generando Prisma Client...');
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: __dirname 
      });
    }

    console.log('[OK] Base de datos de pruebas lista (usando dev.db existente)\n');
  } catch (error) {
    console.error('[ERROR] Error configurando BD de pruebas:', error.message);
    // No fallar si el cliente ya está generado
    console.log('[INFO] Continuando con cliente existente...\n');
  }
}

setupTestDB();
