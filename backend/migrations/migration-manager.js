const fs = require('fs');
const path = require('path');
const versionConfigPath = path.join(__dirname, '../config/version.json');

// Helper para comparar versiones (v1 > v2)
function isNewer(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return true;
    if (p2 > p1) return false;
  }
  return false;
}

// Definir migraciones disponibles
const migrations = {
  '1.0.0': async (db) => {
    console.log('Migración 1.0.0 ya aplicada (Base)');
  },
  // '1.1.0': async (db) => { ... }
};

const MigrationManager = {
  getCurrentVersion: () => {
    if (!fs.existsSync(versionConfigPath)) {
      return '0.0.0';
    }
    try {
      const config = JSON.parse(fs.readFileSync(versionConfigPath, 'utf8'));
      return config.version;
    } catch (e) {
      return '0.0.0';
    }
  },

  updateVersionConfig: (newVersion) => {
    let config = { version: '0.0.0', migrations: { completed: [] } };
    if (fs.existsSync(versionConfigPath)) {
      config = JSON.parse(fs.readFileSync(versionConfigPath, 'utf8'));
    }
    
    config.version = newVersion;
    config.lastUpdate = new Date().toISOString();
    if (!config.migrations.completed.includes(newVersion)) {
      config.migrations.completed.push(newVersion);
    }
    
    fs.writeFileSync(versionConfigPath, JSON.stringify(config, null, 2));
  },

  runMigrations: async (fromVersion, targetVersion) => {
    console.log(`Verificando migraciones de ${fromVersion} a ${targetVersion}...`);

    // Ordenar versiones de migración
    const versions = Object.keys(migrations).sort((a, b) => isNewer(a, b) ? 1 : -1);
    
    for (const version of versions) {
      // Si la versión es mayor que la actual y menor o igual a la objetivo
      if (isNewer(version, fromVersion) && !isNewer(version, targetVersion)) {
        console.log(`Ejecutando migración ${version}...`);
        try {
          await migrations[version]();
          MigrationManager.updateVersionConfig(version);
          console.log(`Migración ${version} completada.`);
        } catch (error) {
          console.error(`Error en migración ${version}:`, error);
          throw error;
        }
      }
    }
    
    // Asegurar que la versión final quede registrada
    MigrationManager.updateVersionConfig(targetVersion);
    console.log('Sincronización de versiones completada.');
  }
};

module.exports = MigrationManager;
