const os = require('os');
const { spawn } = require('child_process');
const path = require('path');

// Obtener memoria total del sistema en GB
const totalMemBytes = os.totalmem();
const totalMemGB = totalMemBytes / (1024 * 1024 * 1024);

console.log(`[System] Memoria Total Detectada: ${totalMemGB.toFixed(2)} GB`);

// Calcular límite de memoria para Node.js (Heap Size)
// Regla:
// - < 4GB RAM: Usar 512MB (muy conservador)
// - 4GB - 8GB: Usar 1024MB (estándar)
// - > 8GB: Usar 2048MB (alto rendimiento)
let maxOldSpaceSize = 1024; // Default

if (totalMemGB < 4.5) { // Equipos de 4GB (aprox 3.8GB utilizables) o menos
  maxOldSpaceSize = 512;
  console.log('[System] Modo: BIZCOCHO (Low RAM). Limitando Heap a 512MB.');
} else if (totalMemGB < 8.5) { // Equipos de 8GB
  maxOldSpaceSize = 1536;
  console.log('[System] Modo: ESTÁNDAR. Heap ajustado a 1.5GB.');
} else { // Equipos de 16GB o más
  maxOldSpaceSize = 4096;
  console.log('[System] Modo: POTENCIA MÁXIMA. Heap liberado a 4GB.');
}

// Determinar script a ejecutar (backend/server.js por defecto)
const targetScript = process.argv[2] || 'backend/server.js';
const scriptPath = path.resolve(targetScript);

console.log(`[System] Iniciando proceso Node.js con --max-old-space-size=${maxOldSpaceSize}...`);

// Spawn del proceso real
const child = spawn('node', [`--max-old-space-size=${maxOldSpaceSize}`, scriptPath], {
  stdio: 'inherit',
  env: process.env,
  shell: true // Necesario para compatibilidad de rutas
});

child.on('close', (code) => {
  console.log(`[System] Proceso finalizado con código: ${code}`);
  process.exit(code);
});

child.on('error', (err) => {
  console.error('[System] Error al iniciar proceso:', err);
});
