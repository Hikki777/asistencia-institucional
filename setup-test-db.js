#!/usr/bin/env node

/**
 * Script para configurar base de datos de test
 * Se ejecuta automáticamente antes de los tests
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

// Configurar entorno de test
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./backend/prisma/test.db';

const testDbPath = path.join(__dirname, 'backend', 'prisma', 'test.db');

async function setupTestDatabase() {
  console.log('🔧 Configurando base de datos de test...');
  
  try {
    // Eliminar base de datos de test anterior si existe
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
      console.log('  └─ Base de datos anterior eliminada');
    }
    
    // Generar cliente Prisma
    console.log('  └─ Generando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema a la base de datos de test
    console.log('  └─ Creando tablas...');
    execSync('npx prisma db push --skip-generate', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: 'file:./backend/prisma/test.db'
      }
    });
    
    console.log('✅ Base de datos de test configurada\n');
  } catch (error) {
    console.error('❌ Error configurando base de datos de test:', error.message);
    process.exit(1);
  }
}

setupTestDatabase();
