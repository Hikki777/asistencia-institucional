const cron = require('node-cron');
const repairService = require('../services/repairService');
const diagnosticsService = require('../services/diagnosticsService');
const backupService = require('../services/backupService');
const { logger } = require('../utils/logger');

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
  logger.info('⏰ Inicializando tareas programadas (cron jobs)');

  // Job 1: Diagnóstico y Auto-Reparación cada 6 horas
  const diagnosticJob = cron.schedule('0 */6 * * *', async () => {
    logger.info('⏱️ Ejecutando tarea de diagnóstico programada');
    try {
      const result = await repairService.autoRepair();
      logger.info({ result }, '✅ Tarea de diagnóstico completada');
    } catch (error) {
      logger.error({ err: error }, '❌ Tarea de diagnóstico falló');
    }
  });
  jobs.push({ name: 'diagnostics', task: diagnosticJob });

  // Job 2: Backup diario a las 2 AM
  const backupJob = cron.schedule('0 2 * * *', async () => {
    logger.info('⏱️ Ejecutando tarea de backup programada');
    try {
      const result = await backupService.crearBackup();
      logger.info({ result }, '✅ Tarea de backup completada');
    } catch (error) {
      logger.error({ err: error }, '❌ Tarea de backup falló');
    }
  });
  jobs.push({ name: 'backup', task: backupJob });

  logger.info({ count: jobs.length }, `✅ Scheduler inicializado con ${jobs.length} tareas`);
}

/**
 * Detener todas las tareas programadas
 */
function detener() {
  logger.info('⏸️ Deteniendo todas las tareas programadas');
  jobs.forEach(job => {
    job.task.stop();
    logger.debug({ jobName: job.name }, `Tarea detenida: ${job.name}`);
  });
  jobs.length = 0;
}

/**
 * Ejecutar diagnóstico manualmente
 */
async function ejecutarDiagnosticoManual() {
  logger.info('🔧 Diagnóstico manual disparado');
  return await repairService.autoRepair();
}

/**
 * Ejecutar backup manualmente
 */
async function ejecutarBackupManual() {
  logger.info('💾 Backup manual disparado');
  return await backupService.crearBackup();
}

module.exports = {
  iniciar,
  detener,
  ejecutarDiagnosticoManual,
  ejecutarBackupManual
};
