# Sistema de Registro Institucional - Estado del Proyecto

**Fecha:** 12 de noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Operativo

---

## 🎯 Resumen del Sistema

Sistema completo de control de asistencias con códigos QR, gestión de alumnos y personal, dashboard en tiempo real y reportes. Incluye auto-reparación, backups automáticos y diagnósticos.

---

## ✅ Funcionalidades Implementadas

### Backend (Node.js + Express + Prisma)
- ✅ API RESTful completa con autenticación JWT
- ✅ Gestión de alumnos y personal (CRUD)
- ✅ Sistema de asistencias (entrada/salida, QR/manual)
- ✅ Generación de códigos QR con logo institucional
- ✅ Diagnósticos automáticos y reparación de QRs
- ✅ Backups automáticos programados
- ✅ Sistema de logs con Pino (JSON estructurado)
- ✅ Rate limiting y caché en memoria
- ✅ Endpoint de métricas del sistema
- ✅ Validación de datos con express-validator
- ✅ Middleware de auditoría

### Frontend (React + Vite + Tailwind)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Panel de alumnos con filtros y búsqueda
- ✅ Panel de personal (docentes/administrativos)
- ✅ Panel de asistencias con escáner QR (html5-qrcode)
- ✅ Panel de configuración institucional
- ✅ Panel de diagnósticos y reparación
- ✅ Panel de reportes (Excel y PDF)
- ✅ **Panel de métricas visual con gráficos en tiempo real** 🆕
- ✅ Gráficos interactivos con Recharts
- ✅ Toasts y notificaciones con react-hot-toast
- ✅ Animaciones con Framer Motion
- ✅ Banner de reconexión cuando backend está offline
- ✅ Manejo de sesiones expiradas con aviso amigable

### Base de Datos (SQLite + Prisma ORM)
- ✅ Modelo unificado: Alumno, Personal, Asistencia, CodigoQr, Usuario, Institucion
- ✅ Relaciones robustas con cascade y soft deletes
- ✅ Índices para rendimiento
- ✅ Migrations versionadas
- ✅ Seed script con datos de prueba

### Infraestructura
- ✅ Scripts de inicio automático multiplataforma (PowerShell)
- ✅ Instalación de fuentes Hack Nerd Font (Windows/macOS/Linux)
- ✅ Configuración de ambiente con dotenv
- ✅ Logs rotados y configurables
- ✅ Health check endpoint
- ✅ ESLint y Prettier configurados en backend
- ✅ Pruebas de integración con Jest y Supertest

---

## 🔧 Mejoras Recientes (Última Iteración)

### 1. Banner de Reconexión en Dashboard
- Banner persistente cuando el backend está offline
- Botón "Reintentar" para recargar stats manualmente
- Diseño con alertas amarillas y icono de advertencia

### 2. Configuración de ESLint/Prettier Backend
- `.eslintrc.json` con reglas recomendadas para Node.js
- `.prettierrc.json` con formato consistente
- `.eslintignore` para excluir node_modules, logs, uploads

### 3. Pruebas de Integración
- Suite completa para `/api/asistencias`:
  - POST con alumno/personal
  - GET /hoy con stats
  - GET / con paginación y filtros
  - GET /stats con días configurables
- Validación de JWT, errores 400/401 y respuestas esperadas

### 4. Endpoint de Métricas
- `GET /api/metrics`: uptime, requests totales, top endpoints, stats de BD, caché, memoria
- `POST /api/metrics/reset`: reseteo manual (solo admin)
- Contadores en memoria para observabilidad básica

### 5. Correcciones de Middleware
- Caché ahora usa `baseUrl + path` para claves precisas
- Rate limiter excluye correctamente `/api/health`
- Dotenv carga siempre `backend/.env` con `__dirname`

---

## 📂 Estructura del Proyecto

```
Sistema de Registro Institucional/
├── backend/
│   ├── .env
│   ├── .eslintrc.json          ← Nuevo
│   ├── .prettierrc.json        ← Nuevo
│   ├── .eslintignore           ← Nuevo
│   ├── server.js
│   ├── prismaClient.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── cache.js            ← Mejorado
│   │   ├── rateLimiter.js      ← Mejorado
│   │   ├── requestLogger.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── alumnos.js
│   │   ├── asistencias.js
│   │   ├── auth.js
│   │   ├── docentes.js
│   │   ├── institucion.js
│   │   ├── metrics.js          ← Nuevo
│   │   ├── qr.js
│   │   ├── repair.js
│   │   └── reportes.js
│   ├── services/
│   │   ├── backupService.js
│   │   ├── diagnosticsService.js
│   │   ├── qrService.js
│   │   ├── repairService.js
│   │   ├── reportService.js
│   │   └── tokenService.js
│   ├── utils/
│   │   └── logger.js
│   ├── jobs/
│   │   └── scheduler.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── __tests__/
│       ├── alumnos.test.js
│       ├── asistencias-integration.test.js  ← Nuevo
│       ├── auth.test.js
│       ├── health.test.js
│       └── validation.test.js
├── frontend-react/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js       ← Mejorado (interceptores)
│   │   │   └── endpoints.js
│   │   ├── components/
│   │   │   ├── AlumnosPanel.jsx
│   │   │   ├── AsistenciasPanel.jsx  ← Mejorado (cliente unificado)
│   │   │   ├── ConfiguracionPanel.jsx
│   │   │   ├── Dashboard.jsx         ← Mejorado (banner offline + acceso métricas)
│   │   │   ├── DiagnosticsPanel.jsx
│   │   │   ├── MetricsPanel.jsx      ← Nuevo (gráficos Recharts)
│   │   │   ├── PersonalPanel.jsx
│   │   │   ├── RepairPanel.jsx
│   │   │   └── ReportesPanel.jsx
│   │   ├── pages/
│   │   │   └── LoginPage.jsx
│   │   └── App.jsx               ← Mejorado (ruta /metricas)
│   ├── vite.config.js
│   └── tailwind.config.js
├── prisma/
│   ├── schema.prisma
│   ├── dev.db                  ← Base de datos activa
│   └── migrations/
├── scripts/
│   ├── install-fonts.js
│   ├── install-hack-nerd-font.ps1
│   ├── install-hack-nerd-font-macos.sh
│   └── install-hack-nerd-font-linux.sh
├── uploads/                    ← Fotos, logos, QRs
├── backups/                    ← Backups automáticos
├── logs/                       ← Logs del backend
├── start-auto.ps1
├── stop-all.ps1
└── package.json
```

---

## 🚀 Cómo Iniciar el Sistema

### Opción 1: Script Automático (Recomendado)
```powershell
.\start-auto.ps1
```

### Opción 2: Manual
```powershell
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend-react
npm run dev
```

### Opción 3: Desarrollo Individual
```powershell
npm run dev:backend   # Solo backend
npm run dev:frontend  # Solo frontend
```

---

## 🧪 Ejecutar Pruebas

```powershell
# Todas las pruebas
npm test

# Solo integración
npm run test:integration

# Watch mode
npm run test:watch
```

---

## 📊 Acceso al Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Métricas:** http://localhost:5000/api/metrics (requiere JWT)
- **Prisma Studio:** `npm run prisma:studio`

### Credenciales por Defecto
- **Email:** admin@test.edu
- **Contraseña:** admin123

---

## 📈 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Perfil del usuario

### Alumnos
- `GET /api/alumnos` - Listar alumnos
- `POST /api/alumnos` - Crear alumno
- `PUT /api/alumnos/:id` - Actualizar alumno
- `DELETE /api/alumnos/:id` - Eliminar alumno

### Personal (Docentes)
- `GET /api/docentes` - Listar personal
- `POST /api/docentes` - Crear personal
- `PUT /api/docentes/:id` - Actualizar personal
- `DELETE /api/docentes/:id` - Eliminar personal

### Asistencias
- `POST /api/asistencias` - Registrar asistencia
- `GET /api/asistencias` - Listar asistencias (paginado)
- `GET /api/asistencias/hoy` - Asistencias del día
- `GET /api/asistencias/stats` - Estadísticas por días

### Diagnósticos y Reparación
- `GET /api/diagnostics/qrs` - Ejecutar diagnóstico
- `POST /api/repair/qrs/regenerate` - Regenerar QRs faltantes
- `POST /api/repair/logo/regenerate` - Regenerar logo

### Métricas
- `GET /api/metrics` - Métricas del sistema
- `POST /api/metrics/reset` - Resetear métricas (admin)

---

## 🔐 Seguridad Implementada

- ✅ JWT con expiración de 8 horas
- ✅ Bcrypt para hash de contraseñas (salt rounds: 10)
- ✅ Rate limiting en todos los endpoints
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado con whitelist
- ✅ Validación de entrada con express-validator
- ✅ Sanitización de logs (sin passwords en logs)
- ✅ HMAC para tokens de QR firmados

---

## 🎨 Tecnologías Utilizadas

### Backend
- Node.js 18+
- Express 4.x
- Prisma ORM 5.x
- SQLite 3
- JWT (jsonwebtoken)
- Bcrypt
- Pino (logging)
- QRCode
- Sharp (procesamiento imágenes)
- ExcelJS + PDFKit (reportes)

### Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- Axios
- Recharts (gráficos)
- Framer Motion (animaciones)
- React Hot Toast (notificaciones)
- Html5-qrcode (escáner QR)
- Lucide React (iconos)

### Herramientas
- ESLint + Prettier
- Jest + Supertest (tests)
- Nodemon (hot reload)
- Prisma Studio (GUI BD)

---

## 📋 Próximos Pasos Sugeridos

### Corto Plazo (1-2 semanas)
1. **Reportes Avanzados**
   - Exportar QRs en PDF masivo
   - Reportes de puntualidad por alumno
   - Dashboard de tendencias mensuales

2. **Mejoras UX**
   - Modo oscuro en frontend
   - PWA para uso offline
   - Notificaciones push

3. **Administración**
   - Panel de usuarios con roles (admin/operador/visualizador)
   - Logs de auditoría visibles en UI
   - Gestión de backups desde UI

### Mediano Plazo (1-2 meses)
4. **Integración**
   - API REST documentada con Swagger/OpenAPI
   - Webhooks para eventos (nueva asistencia, etc.)
   - Importación masiva desde Excel

5. **Escalabilidad**
   - Migrar a PostgreSQL (opcional)
   - Redis para caché distribuido
   - Dockerización completa

6. **Analytics**
   - Dashboard de métricas avanzadas
   - Exportación de métricas a Prometheus/Grafana
   - Alertas por correo (ausencias, problemas)

### Largo Plazo (3+ meses)
7. **Móvil**
   - App nativa con React Native
   - Escaneo de QR optimizado para cámaras móviles

8. **Avanzado**
   - Reconocimiento facial como alternativa a QR
   - Machine Learning para predicción de ausencias
   - Multi-institución (multi-tenant)

---

## 🐛 Problemas Conocidos y Soluciones

### ✅ Resueltos
- ~~Backend no cargaba .env desde raíz~~ → Dotenv ahora usa `__dirname`
- ~~Panel de asistencias 500~~ → Cliente unificado + validación token
- ~~Dashboard mostraba "Docentes"~~ → Ahora muestra "Personal"
- ~~Caché no invalidaba /hoy~~ → Clave ahora usa baseUrl + path
- ~~Health check limitado por rate limiter~~ → Excluido del limiter

### Pendientes (Menores)
- Webfonts WOFF2 opcionales para tipografía sin instalación OS
- Retry exponencial en frontend para requests fallidos
- Vista de logs en tiempo real en DiagnosticsPanel

---

## 🤝 Contribuir

Para contribuir al proyecto:
1. Ejecutar `npm run test` antes de commit
2. Seguir guías de ESLint/Prettier configuradas
3. Actualizar este README si añades funcionalidad mayor
4. Documentar endpoints nuevos en comentarios JSDoc

---

## 📞 Soporte

**Desarrollador:** Sistema de Registro Institucional  
**Repositorio:** https://github.com/Hikki777/asistencia-institucional  
**Licencia:** MIT

---

**Última actualización:** 12 de noviembre de 2025
