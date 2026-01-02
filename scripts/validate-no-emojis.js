#!/usr/bin/env node

/**
 * Script de validación de emojis
 * 
 * Busca emojis en archivos JavaScript del backend y reporta errores.
 * Útil para ejecutar en pre-commit hooks o CI/CD.
 */

const fs = require('fs');
const path = require('path');

// Regex para detectar emojis comunes
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F]/gu;

// Directorios a escanear
const DIRS_TO_SCAN = [
  'backend/routes',
  'backend/services',
  'backend/middlewares',
  'backend/utils',
  'scripts'
];

// Archivos excluidos (contienen emojis intencionales para mapeo/documentación)
const EXCLUDED_FILES = [
  'remove-emojis.js',
  'validate-no-emojis.js'
];

let hasErrors = false;
let totalFiles = 0;
let filesWithEmojis = 0;

console.log('[EMOJI VALIDATOR] Escaneando archivos JavaScript...\n');

function scanFile(filePath) {
  // Verificar si el archivo está excluido
  const fileName = path.basename(filePath);
  if (EXCLUDED_FILES.includes(fileName)) {
    return; // Saltar archivos excluidos
  }

  totalFiles++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  lines.forEach((line, index) => {
    const matches = line.match(EMOJI_REGEX);
    if (matches) {
      errors.push({
        line: index + 1,
        content: line.trim(),
        emojis: matches
      });
    }
  });

  if (errors.length > 0) {
    hasErrors = true;
    filesWithEmojis++;
    console.log(`[ERROR] ${filePath}`);
    errors.forEach(err => {
      console.log(`  Línea ${err.line}: ${err.emojis.join(', ')}`);
      console.log(`    ${err.content.substring(0, 80)}${err.content.length > 80 ? '...' : ''}`);
    });
    console.log('');
  }
}

function scanDirectory(dir) {
  const fullPath = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] ${dir} - Directorio no encontrado`);
    return;
  }

  const files = fs.readdirSync(fullPath);
  
  files.forEach(file => {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && file.endsWith('.js')) {
      scanFile(filePath);
    }
  });
}

// Escanear todos los directorios
DIRS_TO_SCAN.forEach(scanDirectory);

// Escanear archivo principal
const serverPath = path.join(__dirname, '..', 'backend/server.js');
if (fs.existsSync(serverPath)) {
  scanFile(serverPath);
}

// Reporte final
console.log('='.repeat(60));
if (hasErrors) {
  console.log(`[FAIL] Se encontraron emojis en ${filesWithEmojis} de ${totalFiles} archivos`);
  console.log('\nRecomendaciones:');
  console.log('  - Reemplaza emojis con alternativas ASCII:');
  console.log('    ✅ → [OK]');
  console.log('    ❌ → [ERROR]');
  console.log('    ⚠️ → [WARN]');
  console.log('    🚀 → [READY]');
  console.log('    📋 → [API]');
  console.log('\n  - Ejecuta: node scripts/remove-emojis.js');
  console.log('='.repeat(60));
  process.exit(1);
} else {
  console.log(`[OK] No se encontraron emojis en ${totalFiles} archivos escaneados`);
  console.log('='.repeat(60));
  process.exit(0);
}
