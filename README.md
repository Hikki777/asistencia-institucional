# 🎓 Sistema de Registro Institucional

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/tu-usuario/sistema-registro-institucional/pulls)

> Sistema completo de gestión de asistencias para instituciones educativas con códigos QR, panel administrativo React y auto-reparación automática.

**Desarrollado por:** [Kevin Gabriel Pérez García](https://github.com/tu-usuario)

---

## 📑 Tabla de Contenidos

- [Inicio Rápido](#-inicio-rápido-nuevo)
- [Características](#-características)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🚀 Inicio Rápido (NUEVO)

### Iniciar el Sistema Completo
```powershell
.\start-all.ps1
```

✅ **Ventajas:**
- Solo 3 ventanas (1 visible + 2 minimizadas)
- Bajo consumo de recursos (~300MB RAM)
- Abre automáticamente el navegador
- Presiona `Ctrl+C` para detener todo

### Detener el Sistema
```powershell
.\stop-all.ps1
```

📖 **Más información:** Ver [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) para guía detallada.

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **📱 Registro con QR**: Escaneo de códigos QR mediante webcam para registro rápido
- **✍️ Entrada Manual**: Sistema alternativo de búsqueda y selección para registro
- **👥 Gestión Completa**: CRUD de alumnos y personal docente/administrativo
- **📊 Dashboard en Tiempo Real**: Estadísticas, gráficos y métricas de asistencia
- **🏫 Multi-Institución**: Configuración personalizable por institución
- **🖨️ Impresión de QR**: Generador de tarjetas QR profesionales listas para imprimir
- **🔐 Autenticación JWT**: Sistema seguro de login con tokens
- **🔄 Auto-Reparación**: Diagnóstico y regeneración automática de QR cada 6 horas
- **💾 Backups Automáticos**: Respaldos diarios de base de datos
- **🌙 Interfaz Moderna**: UI/UX con Tailwind CSS y animaciones Framer Motion

### 🛠️ Características Técnicas

- **API REST** completa con documentación
- **Validación** de datos en frontend y backend
- **Scheduler** para tareas automatizadas
- **Logging** de auditoría completo
- **Responsive Design** compatible con móviles
- **Hot Reload** en desarrollo

---

## 📸 Capturas de Pantalla

### Dashboard Principal
*(Agrega tu captura aquí)*

### Panel de Asistencias con Escaneo QR
*(Agrega tu captura aquí)*

### Gestión de Alumnos
*(Agrega tu captura aquí)*

### Tarjetas QR para Imprimir
*(Agrega tu captura aquí)*

---

## 🚀 Tecnologías

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework CSS utility-first
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos y visualizaciones
- **html5-qrcode** - Escaneo de códigos QR
- **Lucide React** - Iconos modernos

### Backend
- **Node.js v18+** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - Manejo de base de datos
- **SQLite** - Base de datos (desarrollo)
- **JWT (jsonwebtoken)** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **QRCode + Sharp** - Generación de QR con logos
- **node-cron** - Tareas programadas

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18.0.0 o superior ([Descargar](https://nodejs.org/))
- **npm** v9.0.0 o superior (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))

Verifica las versiones instaladas:

```bash
node --version  # Debe ser >= v18.0.0
npm --version   # Debe ser >= 9.0.0
git --version
```

---

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sistema-registro-institucional.git
cd sistema-registro-institucional
```

### 2. Instalar Dependencias del Backend

```bash
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd frontend-react
npm install
cd ..
```

### 4. Inicializar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev --name init
```

### 5. (Opcional) Poblar con Datos de Prueba

```bash
node backend/prisma/seed.js
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL="file:./dev.db"

# Seguridad
JWT_SECRET="tu_secreto_jwt_super_seguro_cambiame_en_produccion"
HMAC_SECRET="tu_secreto_hmac_super_seguro_cambiame_en_produccion"

# Servidor
PORT=5000
NODE_ENV=development
```

> ⚠️ **IMPORTANTE**: Cambia los secretos en producción. Usa valores aleatorios seguros.

### Configuración de la Institución

Al primer inicio, debes configurar los datos de tu institución:

```bash
POST http://localhost:5000/api/institucion/init
Content-Type: application/json

{
  "nombre": "Tu Institución",
  "horario_inicio": "07:00",
  "margen_puntualidad_min": 5,
  "logo_base64": "data:image/png;base64,...",
  "admin_email": "admin@institucion.edu",
  "admin_password": "Admin123!"
}
```

---

## 🎯 Uso

### Inicio Rápido (Windows - PowerShell)

```powershell
# Iniciar backend + frontend simultáneamente
.\start-system.ps1

# Detener todos los servicios
.\stop-system.ps1
```

### Inicio Manual

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm run dev
```

### Acceso al Sistema

- **Frontend React**: http://localhost:5173
- **API Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### Credenciales Iniciales

Por defecto (después de ejecutar seed):
- **Email**: `admin@test.edu`
- **Password**: `admin`

> ⚠️ **IMPORTANTE**: Cambia estas credenciales inmediatamente en producción.

---

## 📁 Estructura del Proyecto

```
sistema-registro-institucional/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   ├── seed.js            # Datos de prueba
│   │   └── dev.db             # Base de datos SQLite
│   ├── routes/                # Rutas de la API
│   │   ├── auth.js            # Autenticación
│   │   ├── alumnos.js         # CRUD alumnos
│   │   ├── docentes.js        # CRUD personal
│   │   ├── asistencias.js     # Registro asistencias
│   │   ├── qr.js              # Generación QR
│   │   └── repair.js          # Auto-reparación
│   ├── services/              # Lógica de negocio
│   │   ├── tokenService.js
│   │   ├── qrService.js
│   │   ├── diagnosticsService.js
│   │   ├── repairService.js
│   │   └── backupService.js
│   ├── middlewares/
│   │   └── auth.js            # Middleware JWT
│   ├── jobs/
│   │   └── scheduler.js       # Tareas automatizadas
│   └── server.js              # Servidor principal
├── frontend-react/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AlumnosPanel.jsx
│   │   │   ├── DocentesPanel.jsx
│   │   │   ├── AsistenciasPanel.jsx
│   │   │   ├── ConfiguracionPanel.jsx
│   │   │   ├── DiagnosticsPanel.jsx
│   │   │   └── RepairPanel.jsx
│   │   ├── pages/
│   │   │   └── LoginPage.jsx
│   │   ├── api/
│   │   │   ├── client.js      # Cliente Axios
│   │   │   └── endpoints.js   # Configuración endpoints
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── uploads/
│   ├── qrs/                   # Códigos QR generados
│   ├── logos/                 # Logo institucional
│   └── fotos/                 # Fotos de usuarios
├── backups/                   # Respaldos automáticos
├── .env                       # Variables de entorno
├── .gitignore
├── LICENSE                    # Licencia MIT
├── package.json
├── start-system.ps1           # Script inicio Windows
├── stop-system.ps1            # Script detención Windows
└── README.md
```

---

## 📡 API Documentation

### Autenticación

#### `POST /api/auth/login`
Iniciar sesión y obtener token JWT.

**Request:**
```json
{
  "email": "admin@test.edu",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@test.edu",
    "rol": "admin"
  }
}
```

### Códigos QR

#### `POST /api/qr/generar`
Generar código QR para un alumno o personal.

**Request:**
```json
{
  "persona_tipo": "alumno",
  "persona_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "codigo_qr": {
    "id": 15,
    "token": "eyJhbGc...",
    "png_url": "/uploads/qrs/alumno-A12345.png",
    "persona": {
      "tipo": "alumno",
      "nombre": "Juan Pérez",
      "carnet": "A12345"
    }
  }
}
```

#### `GET /api/qr/:id/png`
Obtener imagen PNG del código QR.

### Asistencias

#### `POST /api/asistencias`
Registrar asistencia (entrada/salida).

**Request:**
```json
{
  "carnet": "A12345",
  "persona_tipo": "alumno",
  "tipo_evento": "entrada"
}
```

#### `GET /api/asistencias/hoy`
Obtener asistencias del día actual.

### Diagnóstico y Reparación

#### `GET /api/diagnostics/qrs`
Ejecutar diagnóstico completo del sistema.

#### `POST /api/repair/qrs/regenerate`
Regenerar códigos QR faltantes o corruptos.

**Request:**
```json
{
  "ids": [5, 10, 15]
}
// O regenerar todos:
{
  "all": true
}
```

---

## 📜 Scripts Disponibles

### Backend

```bash
npm run dev          # Desarrollo con nodemon (auto-restart)
npm start            # Producción
npm run prisma:studio # Abrir Prisma Studio
npm run prisma:generate # Generar cliente Prisma
```

### Frontend

```bash
cd frontend-react
npm run dev          # Servidor de desarrollo (Vite)
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run lint         # Linter ESLint
```

### Utilidades

```bash
node regenerar-qrs.js              # Regenerar todos los QR
node generar-qrs-sin-logo.js       # Generar QR sin logo
node check-user.js                 # Verificar usuarios en BD
node reset-password.js             # Resetear contraseña
node list-data.js                  # Listar datos de prueba
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

### 1. Fork el Proyecto

Haz clic en el botón "Fork" en la esquina superior derecha.

### 2. Crea una Rama

```bash
git checkout -b feature/NuevaCaracteristica
```

### 3. Haz tus Cambios

Asegúrate de seguir las convenciones de código y agregar tests si es necesario.

### 4. Commit

```bash
git commit -m "Add: Nueva característica increíble"
```

Usa prefijos:
- `Add:` para nuevas características
- `Fix:` para correcciones
- `Update:` para actualizaciones
- `Refactor:` para refactorización

### 5. Push

```bash
git push origin feature/NuevaCaracteristica
```

### 6. Abre un Pull Request

Ve a tu fork en GitHub y haz clic en "New Pull Request".

### Guías de Contribución

- Sigue el estilo de código existente
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Asegúrate de que todos los tests pasen
- Describe claramente tus cambios en el PR

---

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Busca en los [issues existentes](https://github.com/tu-usuario/sistema-registro-institucional/issues)
2. Si no existe, [crea un nuevo issue](https://github.com/tu-usuario/sistema-registro-institucional/issues/new)
3. Describe el problema claramente
4. Incluye pasos para reproducir
5. Adjunta capturas de pantalla si es posible

---

## 📝 Roadmap

### En Desarrollo
- [ ] App móvil nativa (React Native)
- [ ] Reconocimiento facial
- [ ] Notificaciones por email/SMS

### Planeado
- [ ] Modo offline con sincronización
- [ ] Reportes avanzados en PDF/Excel
- [ ] Integración con Google Classroom
- [ ] Multi-idioma (i18n)
- [ ] Dashboard de métricas avanzadas
- [ ] Exportación de datos a sistemas externos

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Kevin Gabriel Pérez García

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software y archivos de documentación asociados (el "Software"), para
utilizar el Software sin restricciones, incluyendo sin limitación los derechos
de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar, y/o
vender copias del Software...
```

### Atribución

Si utilizas este proyecto, por favor da crédito a:
- **Autor**: Kevin Gabriel Pérez García
- **Repositorio**: https://github.com/tu-usuario/sistema-registro-institucional

---

## 🙏 Agradecimientos

- Comunidad de [React](https://react.dev/)
- [Prisma](https://www.prisma.io/) por su excelente ORM
- [Tailwind CSS](https://tailwindcss.com/) por el framework CSS
- Todas las librerías open source utilizadas
- Contribuidores y testers del proyecto

---

## 📞 Contacto

**Kevin Gabriel Pérez García**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)

---

## 🌟 Soporte

Si este proyecto te fue útil:

- ⭐ Dale una estrella en GitHub
- 🐛 Reporta bugs
- 💡 Sugiere nuevas características
- 🔄 Haz un fork y contribuye
- 📢 Compártelo con otros

---

<div align="center">

**Desarrollado con ❤️ por Kevin Gabriel Pérez García**

[⬆ Volver arriba](#-sistema-de-registro-institucional)

</div>

## 🎯 Descripción

Sistema completo de control de asistencias mediante códigos QR con **autenticación JWT**, **panel administrativo React** y **auto-reparación automática**:

- 🔐 **Autenticación JWT** con rutas protegidas
- 🎨 **Panel Admin React** (Vite + Tailwind + React Router)
- ✅ Generación de QR con logo institucional
- ✅ CRUD completo de alumnos con validación
- ✅ Diagnóstico y reparación de QR en UI
- ✅ Scheduler automático cada 6 horas
- ✅ Backups diarios (2 AM)
- ✅ Auditoría completa de operaciones

## 🏗️ Arquitectura

```
├── Backend: Node.js + Express + Prisma + JWT
├── Frontend: React 18 + Vite + Tailwind CSS
├── BD: SQLite (desarrollo) / PostgreSQL (producción)
├── Auth: jsonwebtoken + bcrypt
├── QR: qrcode + sharp (con logo institucional)
├── Scheduler: node-cron (auto-reparación)
└── Storage: /uploads (qrs, logos, fotos)
```

## 🚀 Inicio Rápido (< 1 min)

### Opción 1: Script Automático (Recomendado)

```powershell
# Iniciar backend + frontend simultáneamente
.\start.ps1

# Detener todo
.\stop-system.ps1
```

El script `start.ps1`:
- ✅ Inicia Backend en puerto 5000
- ✅ Inicia Frontend en puerto 5173
- ✅ Ambos corren como jobs en segundo plano
- ✅ Muestra estado y comandos útiles

### Opción 2: Manual

```bash
# Terminal 1: Backend
node backend/server.js

# Terminal 2: Frontend
cd frontend-react
npm run dev
```

**Acceso:**
- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>

**Credenciales por defecto:**
- Email: `admin@test.edu`
- Password: `admin`

## 📚 Documentación

- **[GUIA_RAPIDA.md](./GUIA_RAPIDA.md)** - Inicio rápido y comandos esenciales
- **[ESTADO_SISTEMA_COMPLETADO.md](./ESTADO_SISTEMA_COMPLETADO.md)** - Estado completo y roadmap
- **[DIAGNOSTICO_Y_REPARACION.md](./DIAGNOSTICO_Y_REPARACION.md)** - Sistema de auto-reparación
- **[frontend-react/README.md](./frontend-react/README.md)** - Documentación del frontend

```bash
npx prisma db push
```

### 4. Iniciar Servidor

```bash
npm run dev
```

Servidor corriendo en: `http://localhost:5000`

## 📡 API Endpoints

### Inicialización

#### POST `/api/institucion/init`
Inicializar institución (primera ejecución).

```bash
curl -X POST http://localhost:5000/api/institucion/init \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Colegio Mi Fe",
    "horario_inicio": "07:00",
    "margen_puntualidad_min": 5,
    "logo_base64": "data:image/png;base64,...",
    "admin_email": "admin@colegio.edu",
    "admin_password": "Admin123!"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "institucion": { "id": 1, "nombre": "Colegio Mi Fe", ... },
  "admin": { "email": "admin@colegio.edu", "rol": "admin" }
}
```

#### GET `/api/institucion`
Obtener datos de la institución.

```bash
curl http://localhost:5000/api/institucion
```

### QR

#### POST `/api/qr/generar`
Generar QR para alumno o personal.

```bash
curl -X POST http://localhost:5000/api/qr/generar \
  -H "Content-Type: application/json" \
  -d '{
    "persona_tipo": "alumno",
    "persona_id": 1
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "codigo_qr": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "png_url": "/uploads/qrs/alumno-12345.png",
    "persona": { "tipo": "alumno", "nombre": "Juan Pérez", "carnet": "12345" }
  }
}
```

#### GET `/api/qr/:id/png`
Servir PNG del QR (regenera automáticamente si falta).

```bash
curl http://localhost:5000/api/qr/1/png > qr.png
```

#### GET `/api/qr/listar/todos`
Listar todos los QR generados.

```bash
curl http://localhost:5000/api/qr/listar/todos
```

### Diagnóstico y Reparación

#### GET `/api/diagnostics/qrs`
Ejecutar diagnóstico completo.

```bash
curl http://localhost:5000/api/diagnostics/qrs
```

**Respuesta:**
```json
{
  "timestamp": "2025-11-02T17:30:00.000Z",
  "total_qrs": 50,
  "missing_qrs": [
    {
      "id": 5,
      "persona_tipo": "alumno",
      "carnet": "A001",
      "reason": "file_not_found"
    }
  ],
  "corrupt_qrs": [],
  "missing_logo": false
}
```

#### POST `/api/repair/qrs/regenerate`
Regenerar QR específicos o todos.

```bash
# Regenerar QR específicos
curl -X POST http://localhost:5000/api/repair/qrs/regenerate \
  -H "Content-Type: application/json" \
  -d '{ "ids": [5, 10, 15] }'

# O regenerar todos
curl -X POST http://localhost:5000/api/repair/qrs/regenerate \
  -H "Content-Type: application/json" \
  -d '{ "all": true }'
```

**Respuesta:**
```json
{
  "success": true,
  "resultado": {
    "timestamp": "2025-11-02T17:30:00.000Z",
    "regenerados": [
      { "id": 5, "persona_tipo": "alumno", "carnet": "A001", "png_path": "qrs/alumno-A001.png" }
    ],
    "fallidos": []
  }
}
```

#### POST `/api/repair/logo/regenerate`
Regenerar logo desde logo_base64 en BD.

```bash
curl -X POST http://localhost:5000/api/repair/logo/regenerate
```

#### POST `/api/repair/auto`
Ejecutar auto-reparación manual.

```bash
curl -X POST http://localhost:5000/api/repair/auto
```

## 🔄 Tareas Automáticas (Scheduler)

El sistema ejecuta automáticamente:

| Tarea | Horario | Acción |
|-------|---------|--------|
| Diagnóstico + Auto-Reparación | Cada 6 horas | Detecta y regenera QR faltantes |
| Backup | 2 AM (diario) | Crea ZIP de BD + /uploads |

Ver logs en consola para estado de ejecución.

## 📁 Estructura de Archivos

```
asistencias-qr/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Definición BD
│   │   └── dev.db          # BD SQLite
│   ├── services/
│   │   ├── tokenService.js
│   │   ├── qrService.js
│   │   ├── diagnosticsService.js
│   │   ├── repairService.js
│   │   ├── backupService.js
│   │   └── asistenciasService.js
│   ├── routes/
│   │   ├── qr.js
│   │   └── repair.js
│   ├── jobs/
│   │   └── scheduler.js
│   ├── prismaClient.js
│   └── server.js
├── uploads/
│   ├── qrs/               # Códigos QR generados
│   ├── logos/             # Logo institucional
│   └── fotos/             # Fotos de personas
├── backups/               # Backups automáticos
├── .env                   # Configuración
├── package.json
└── README.md
```

## 🔧 Procedimiento de Auto-Reparación

El sistema **automáticamente** cada 6 horas:

1. **Ejecuta diagnóstico** → Lee todas las filas de `codigos_qr`
2. **Detecta problemas:**
   - QR PNG faltante
   - QR PNG corrupto (< 1KB)
   - Logo faltante en BD
3. **Auto-repara:**
   - Regenera PNG desde token + logo_base64 en BD
   - Regenera logo desde logo_base64
4. **Registra en auditoria** cada acción
5. **Crea backup** tras reparación

### Ejemplo de Flujo

```
[Diagnóstico cada 6 horas]
  ↓
[Detecta 5 QR faltantes]
  ↓
[Regenera desde BD automáticamente]
  ↓
[Registra en auditoria: "regenerar"]
  ↓
[Backup ZIP creado]
  ↓
[Sistema recuperado ✅]
```

## 🚨 Recuperación Manual ante Fallos

Si el sistema falla y las auto-reparaciones no funcionan:

### Paso 1: Ejecutar Diagnóstico
```bash
curl http://localhost:5000/api/diagnostics/qrs | jq
```

### Paso 2: Revisar Problemas
- Si `missing_logo: true` → Regenerar logo
- Si `missing_qrs: []` tiene items → Regenerar QR

### Paso 3: Reparar Logo (si es necesario)
```bash
curl -X POST http://localhost:5000/api/repair/logo/regenerate
```

### Paso 4: Reparar QR
```bash
# Regenerar todos los QR faltantes
curl -X POST http://localhost:5000/api/repair/qrs/regenerate \
  -d '{ "all": true }' -H "Content-Type: application/json"
```

### Paso 5: Verificar y Backup
```bash
# Verificar recuperación
curl http://localhost:5000/api/diagnostics/qrs

# Crear backup tras reparación
curl -X POST http://localhost:5000/api/repair/auto
```

## 📊 Ejemplo: Crear Alumno + Generar QR

```bash
# 1. Crear alumno en BD (directamente o via API CRUD)
# [Pendiente: crear ruta POST /api/alumnos]

# 2. Generar QR
curl -X POST http://localhost:5000/api/qr/generar \
  -H "Content-Type: application/json" \
  -d '{
    "persona_tipo": "alumno",
    "persona_id": 1
  }'

# 3. Descargar PNG
curl http://localhost:5000/api/qr/1/png > qr.png
```

## 🛡️ Seguridad

- **Tokens HMAC:** Firmados con SHA256 + base64url
- **Logo en BD:** Almacenado como base64 para regeneraciones
- **Auditoria:** Cada operación se registra
- **Backups:** ZIP comprimido con BD + archivos
- **Secrets en .env:** JWT_SECRET y HMAC_SECRET fuera del repo

## 📝 Logs y Debugging

Ver logs en consola durante ejecución:

```
[QRService] QR generated successfully: uploads/qrs/alumno-12345.png
[DiagnosticsService] Diagnostics completed: { total: 50, missing: 0 }
[RepairService] Auto-repair job started
[Scheduler] Diagnostic job completed: { healthy: true }
```

## 🐛 Troubleshooting

### "Institución no inicializada"
→ Ejecutar: `POST /api/institucion/init`

### "Error guardando logo"
→ Verificar formato base64 del logo

### "QR PNG no se genera"
→ Ejecutar diagnóstico, luego `/api/repair/qrs/regenerate`

### "BD corrupta"
→ Buscar archivo: `backend/prisma/dev.db` y regenerar con `npx prisma db push`

## 📚 Próximas Mejoras

- [ ] CRUD completo para alumnos/personal
- [ ] Endpoints asistencias (entrada/salida)
- [ ] Reportes Excel con encabezado
- [ ] Frontend React con Vite
- [ ] JWT authentication
- [ ] WebSocket para progreso en tiempo real

## 📞 Soporte

Para errores o preguntas, revisar:
1. Logs de consola
2. Tabla `auditoria` en BD
3. Archivos en `/uploads` y `/backups`

---

**Sistema listo para producción con auto-reparación integrada** ✅
