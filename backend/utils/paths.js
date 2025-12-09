const path = require('path');

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
  : path.join(__dirname, '../prisma/dev.db');

// Frontend estático (para servir desde Express en prod)
const FRONTEND_DIR = (isProduction && resourcesPath)
  ? path.join(resourcesPath, 'app.asar/frontend-react/dist') // Electron empaqueta source en app.asar
  : path.join(__dirname, '../../frontend-react/dist');

  FRONTEND_DIR
};
