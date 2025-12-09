# Backend - Sistema de Registro Institucional

## Estructura

```
backend/
├── prisma/
│   ├── schema.prisma       # Definición de DB
│   ├── seed.js             # Script de inicialización
│   └── dev.db              # BD SQLite (gitignored)
├── services/
│   ├── tokenService.js     # Generación y validación de tokens
│   ├── qrService.js        # Generación de QR con logo
│   ├── diagnosticsService.js # Diagnóstico de archivos
│   ├── repairService.js    # Regeneración automática
│   ├── asistenciasService.js # Lógica de asistencias
│   ├── backupService.js    # Backups ZIP
│   └── reportesService.js  # Generación de reportes Excel
├── middleware/
│   ├── auth.js             # JWT y protección
│   └── errorHandler.js     # Manejo de errores
├── routes/
│   ├── institucion.js      # POST/GET institucion
│   ├── qr.js               # Generación y servicio de QR
│   ├── asistencias.js      # Marcar entrada/salida
│   ├── diagnostics.js      # Diagnóstico
│   ├── repair.js           # Reparación
│   ├── backup.js           # Backups
│   ├── reportes.js         # Reportes
│   └── usuarios.js         # Gestión de usuarios
├── jobs/
│   └── scheduler.js        # node-cron tasks
├── utils/
│   ├── logger.js           # Logging
│   ├── constants.js        # Constantes
│   └── helpers.js          # Utilidades
└── server.js               # Punto de entrada
```

## Endpoints

- `POST /api/institucion/init` - Inicializar institución
- `GET /api/institucion` - Obtener datos
- `POST /api/qr/generar` - Generar QR
- `GET /api/qr/:id/png` - Servir PNG
- `POST /api/asistencias/marcar` - Marcar asistencia
- `GET /api/diagnostics/qrs` - Diagnóstico
- `POST /api/repair/qrs/regenerate` - Reparar QR
- `POST /api/repair/logo/regenerate` - Reparar logo
- `POST /api/backup/create` - Crear backup
