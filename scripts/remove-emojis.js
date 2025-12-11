const fs = require('fs');
const path = require('path');

// Mapeo de emojis a reemplazos ASCII
const emojiReplacements = {
  '🚀': '[OK]',
  '✅': '[OK]',
  '❌': '[ERROR]',
  '⚠️': '[WARNING]',
  '🔌': '[DATABASE]',
  '🔍': '[DEBUG]',
  '📋': '[API]',
  '📝': '[API]',
  '📄': '[REPORT]',
  '📊': '[REPORT]',
  '📥': '[REQUEST]',
  '🔄': '[HTTP]',
  '💾': '[CACHE]',
  '🗑️': '[CACHE]',
  '🧹': '[CLEANUP]',
  '🌱': '[SEED]',
  '🏫': '[SEED]',
  '📚': '[SEED]',
  '👨‍🏫': '[SEED]',
};

// Archivos a procesar (excluyendo seed.js)
const filesToProcess = [
  'backend/services/reportService.js',
  'backend/services/qrService.js',
  'backend/services/tokenService.js',
  'backend/services/cloudinaryService.js',
  'backend/routes/reportes.js',
  'backend/routes/asistencias.js',
  'backend/routes/usuarios.js',
  'backend/routes/alumnos.js',
  'backend/routes/docentes.js',
  'backend/routes/auth.js',
  'backend/routes/qr.js',
  'backend/middlewares/requestLogger.js',
  'backend/middlewares/cache.js',
];

const projectRoot = __dirname;
let totalReplacements = 0;

console.log('[SCRIPT] Iniciando reemplazo masivo de emojis...\n');

filesToProcess.forEach(relPath => {
  const fullPath = path.join(projectRoot, relPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] ${relPath} - Archivo no encontrado`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileReplacements = 0;
  
  Object.entries(emojiReplacements).forEach(([emoji, replacement]) => {
    const regex = new RegExp(emoji, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, replacement);
      fileReplacements += matches.length;
    }
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[OK] ${relPath} - ${fileReplacements} reemplazos`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`[SKIP] ${relPath} - Sin emojis`);
  }
});

console.log(`\n[DONE] Total de emojis reemplazados: ${totalReplacements}`);
