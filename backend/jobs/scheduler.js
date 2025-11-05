const cron = require('node-cron');
const repairService = require('../services/repairService');
const diagnosticsService = require('../services/diagnosticsService');
const backupService = require('../services/backupService');

/**
 * Scheduler para tareas automáticas
 * - Diagnóstico cada 6 horas
 * - Auto-reparación si se detectan problemas
 * - Backup diario
 */

const jobs = [];

/**
 * Iniciar todas las tareas programadas
 */
function iniciar() {
  console.log('[Scheduler] Initializing cron jobs...');

  // Job 1: Diagnóstico y Auto-Reparación cada 6 horas
  const diagnosticJob = cron.schedule('0 */6 * * *', async () => {
    console.log('\n⏱️  [Scheduler] Running diagnostic job...');
    try {
      const result = await repairService.autoRepair();
      console.log('[Scheduler] Diagnostic job completed:', result);
    } catch (error) {
      console.error('[Scheduler] Diagnostic job failed:', error.message);
    }
  });
  jobs.push({ name: 'diagnostics', task: diagnosticJob });

  // Job 2: Backup diario a las 2 AM
  const backupJob = cron.schedule('0 2 * * *', async () => {
    console.log('\n⏱️  [Scheduler] Running backup job...');
    try {
      const result = await backupService.crearBackup();
      console.log('[Scheduler] Backup job completed:', result);
    } catch (error) {
      console.error('[Scheduler] Backup job failed:', error.message);
    }
  });
  jobs.push({ name: 'backup', task: backupJob });

  console.log(`✅ Scheduler initialized with ${jobs.length} jobs`);
}

/**
 * Detener todas las tareas programadas
 */
function detener() {
  console.log('[Scheduler] Stopping all jobs...');
  jobs.forEach(job => {
    job.task.stop();
    console.log(`  - Job stopped: ${job.name}`);
  });
  jobs.length = 0;
}

/**
 * Ejecutar diagnóstico manualmente
 */
async function ejecutarDiagnosticoManual() {
  console.log('[Scheduler] Manual diagnostic triggered');
  return await repairService.autoRepair();
}

/**
 * Ejecutar backup manualmente
 */
async function ejecutarBackupManual() {
  console.log('[Scheduler] Manual backup triggered');
  return await backupService.crearBackup();
}

module.exports = {
  iniciar,
  detener,
  ejecutarDiagnosticoManual,
  ejecutarBackupManual
};
