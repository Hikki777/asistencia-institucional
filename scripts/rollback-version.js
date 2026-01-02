require('dotenv').config();
const { restoreSystemBackup } = require('./backup-utils');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BACKUP_DIR = path.join(__dirname, '../backups');
const SYSTEM_PASSWORD = process.env.UPDATE_SECRET || 'sys-update-safe-key-2026';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('🔙 SISTEMA DE RESTAURACIÓN (ROLLBACK)');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ No se encontró directorio de backups.');
    process.exit(1);
  }

  // Listar backups
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.bak'))
    .sort()
    .reverse(); // Más recientes primero

  if (files.length === 0) {
    console.error('❌ No hay backups disponibles.');
    process.exit(1);
  }

  console.log('Backups disponibles:');
  files.slice(0, 5).forEach((f, i) => console.log(`${i + 1}. ${f}`));

  rl.question('Selecciona el número de backup a restaurar (1): ', async (answer) => {
    const index = parseInt(answer || '1') - 1;
    
    if (index < 0 || index >= files.length) {
      console.error('Opción inválida');
      rl.close();
      return;
    }

    const targetBackup = path.join(BACKUP_DIR, files[index]);

    rl.question('⚠️ ¿Estás SEGURO? Esto sobrescribirá los datos actuales. (s/n): ', async (confirm) => {
      if (confirm.toLowerCase() === 's') {
        try {
          await restoreSystemBackup(targetBackup, SYSTEM_PASSWORD);
        } catch (error) {
          console.error('Error restaurando:', error.message);
        }
      } else {
        console.log('Cancelado.');
      }
      rl.close();
    });
  });
}

main();
