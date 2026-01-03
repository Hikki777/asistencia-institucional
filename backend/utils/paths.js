const path = require('path');
// Railway deployment fix v2 (cache buster)

const isProduction = process.env.NODE_ENV === 'production';

// En producción (Electron), RESOURCES_PATH es pasado por el proceso principal
// En desarrollo, usamos rutas relativas desde este archivo (backend/utils/paths.js)
const resourcesPath = process.env.RESOURCES_PATH;

const UPLOADS_DIR = (isProduction && resourcesPath)
  ? path.join(resourcesPath, 'uploads')
  : path.join(__dirname, '../../uploads');

// Base de datos
const DB_PATH = (isProduction && resourcesPath)
  ? path.join(resourcesPath, 'backend/prisma/dev.db')
  : path.join(__dirname, '../../prisma/dev.db');

// Frontend estático (para servir desde Express en prod)
const FRONTEND_DIR = path.join(__dirname, '../../frontend/dist');

module.exports = {
  UPLOADS_DIR,
  DB_PATH,
  FRONTEND_DIR
};
