# 🎓 Sistema de Registro Institucional# 🎓 Sistema de Registro Institucional



Sistema completo de gestión de asistencias para instituciones educativas con códigos QR, panel administrativo React y sistema de auto-reparación.[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ✨ Características Principales[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/tu-usuario/sistema-registro-institucional/pulls)



- 📱 **Registro con QR**: Escaneo mediante webcam para registro rápido> Sistema completo de gestión de asistencias para instituciones educativas con códigos QR, panel administrativo React y auto-reparación automática.

- ✍️ **Entrada Manual**: Sistema alternativo de búsqueda y selección

- 👥 **Gestión Completa**: CRUD de alumnos y personal**Desarrollado por:** [Kevin Gabriel Pérez García](https://github.com/tu-usuario)

- 📊 **Dashboard en Tiempo Real**: Estadísticas, gráficos y métricas

- 🖨️ **Impresión de QR**: Generador de tarjetas profesionales---

- 🔐 **Autenticación JWT**: Sistema seguro con tokens

- 🔄 **Auto-Reparación**: Diagnóstico automático cada 6 horas## 📑 Tabla de Contenidos

- 💾 **Backups Automáticos**: Respaldos diarios de base de datos

- [Inicio Rápido](#-inicio-rápido-nuevo)

## 🚀 Inicio Rápido- [Características](#-características)

- [Capturas de Pantalla](#-capturas-de-pantalla)

### Requisitos Previos- [Tecnologías](#-tecnologías)

- [Requisitos Previos](#-requisitos-previos)

- Node.js v18.0.0 o superior- [Instalación](#-instalación)

- npm v9.0.0 o superior- [Configuración](#-configuración)

- [Uso](#-uso)

### Instalación- [Estructura del Proyecto](#-estructura-del-proyecto)

- [API Documentation](#-api-documentation)

```powershell- [Scripts Disponibles](#-scripts-disponibles)

# 1. Clonar el repositorio- [Contribuir](#-contribuir)

git clone https://github.com/Hikki777/asistencia-institucional.git- [Licencia](#-licencia)

cd asistencia-institucional- [Contacto](#-contacto)



# 2. Instalar dependencias del proyecto---

npm install

## 🚀 Inicio Rápido (NUEVO)

# 3. Instalar dependencias del frontend

cd frontend-react### Iniciar el Sistema Completo

npm install```powershell

cd ...\start-all.ps1

```

# 4. Generar cliente Prisma

npx prisma generate✅ **Ventajas:**

- Solo 1 terminal de VS Code

# 5. Aplicar migraciones a la base de datos- Sin ventanas externas (CMD/PowerShell)

npx prisma migrate deploy- Consumo mínimo de recursos (~250MB RAM)

- Abre automáticamente el navegador

# 6. (Opcional) Poblar con datos de prueba- Presiona `Ctrl+C` para detener todo

node backend/prisma/seed.js

### Detener el Sistema

# 7. Crear usuario administrador```powershell

node crear-admin.js.\stop-all.ps1

``````



### Iniciar el Sistema📖 **Más información:** Ver [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) para guía detallada.



```powershell---

# Opción 1: Script automático (Recomendado)

# Libera puertos automáticamente, sin ventanas externas## ✨ Características

.\start-auto.ps1

### 🎯 Funcionalidades Principales

# Opción 2: Comando NPM integrado

npm run dev- **📱 Registro con QR**: Escaneo de códigos QR mediante webcam para registro rápido

```- **✍️ Entrada Manual**: Sistema alternativo de búsqueda y selección para registro

- **👥 Gestión Completa**: CRUD de alumnos y personal docente/administrativo

### Detener el Sistema- **📊 Dashboard en Tiempo Real**: Estadísticas, gráficos y métricas de asistencia

- **🏫 Multi-Institución**: Configuración personalizable por institución

```powershell- **🖨️ Impresión de QR**: Generador de tarjetas QR profesionales listas para imprimir

.\stop-all.ps1- **🔐 Autenticación JWT**: Sistema seguro de login con tokens

```- **🔄 Auto-Reparación**: Diagnóstico y regeneración automática de QR cada 6 horas

- **💾 Backups Automáticos**: Respaldos diarios de base de datos

### Acceso al Sistema- **🌙 Interfaz Moderna**: UI/UX con Tailwind CSS y animaciones Framer Motion



- **Frontend**: http://localhost:5173### 🛠️ Características Técnicas

- **Backend API**: http://localhost:5000

- **Health Check**: http://localhost:5000/api/health- **API REST** completa con documentación

- **Validación** de datos en frontend y backend

**Credenciales por defecto:**- **Scheduler** para tareas automatizadas

- Email: `admin@test.edu`- **Logging** de auditoría completo

- Contraseña: `admin123`- **Responsive Design** compatible con móviles

- **Hot Reload** en desarrollo

## 🏗️ Tecnologías

---

### Frontend

- **React 18** - Biblioteca UI## 📸 Capturas de Pantalla

- **Vite** - Build tool ultrarrápido

- **TailwindCSS** - Framework CSS utility-first### Dashboard Principal

- **Framer Motion** - Animaciones fluidas*(Agrega tu captura aquí)*

- **html5-qrcode** - Escaneo de códigos QR

- **Recharts** - Gráficos y visualizaciones### Panel de Asistencias con Escaneo QR

- **Lucide React** - Iconos modernos*(Agrega tu captura aquí)*



### Backend### Gestión de Alumnos

- **Node.js v18+** - Runtime JavaScript*(Agrega tu captura aquí)*

- **Express.js** - Framework web

- **Prisma ORM** - Manejo de base de datos### Tarjetas QR para Imprimir

- **SQLite** - Base de datos (desarrollo)*(Agrega tu captura aquí)*

- **JWT** - Autenticación con tokens

- **bcryptjs** - Encriptación de contraseñas---

- **QRCode + Sharp** - Generación de QR con logos

- **node-cron** - Tareas programadas## 🚀 Tecnologías



## 📁 Estructura del Proyecto### Frontend

- **React 18** - Biblioteca UI

```- **Vite** - Build tool y dev server

Sistema de Registro Institucional/- **TailwindCSS** - Framework CSS utility-first

├── backend/- **Framer Motion** - Animaciones

│   ├── prisma/- **Recharts** - Gráficos y visualizaciones

│   │   ├── schema.prisma     # Esquema de base de datos- **html5-qrcode** - Escaneo de códigos QR

│   │   ├── seed.js           # Datos de prueba- **Lucide React** - Iconos modernos

│   │   └── migrations/       # Historial de migraciones

│   ├── routes/               # Rutas de la API### Backend

│   │   ├── auth.js           # Autenticación- **Node.js v18+** - Runtime JavaScript

│   │   ├── alumnos.js        # CRUD alumnos- **Express.js** - Framework web

│   │   ├── docentes.js       # CRUD personal- **Prisma ORM** - Manejo de base de datos

│   │   ├── asistencias.js    # Registro asistencias- **SQLite** - Base de datos (desarrollo)

│   │   ├── qr.js             # Generación QR- **JWT (jsonwebtoken)** - Autenticación

│   │   └── repair.js         # Auto-reparación- **bcryptjs** - Encriptación de contraseñas

│   ├── services/             # Lógica de negocio- **QRCode + Sharp** - Generación de QR con logos

│   ├── middlewares/          # Middlewares (auth, validation, cache)- **node-cron** - Tareas programadas

│   ├── jobs/                 # Tareas programadas (scheduler)

│   └── server.js             # Servidor principal---

├── frontend-react/

│   ├── src/## 📋 Requisitos Previos

│   │   ├── components/       # Componentes React

│   │   │   ├── Dashboard.jsxAntes de comenzar, asegúrate de tener instalado:

│   │   │   ├── AlumnosPanel.jsx

│   │   │   ├── PersonalPanel.jsx- **Node.js** v18.0.0 o superior ([Descargar](https://nodejs.org/))

│   │   │   ├── AsistenciasPanel.jsx- **npm** v9.0.0 o superior (incluido con Node.js)

│   │   │   └── ...- **Git** ([Descargar](https://git-scm.com/))

│   │   ├── pages/            # Páginas

│   │   ├── api/              # Cliente API AxiosVerifica las versiones instaladas:

│   │   ├── App.jsx

│   │   └── main.jsx```bash

│   └── vite.config.jsnode --version  # Debe ser >= v18.0.0

├── uploads/npm --version   # Debe ser >= 9.0.0

│   ├── qrs/                  # Códigos QR generadosgit --version

│   ├── logos/                # Logo institucional```

│   └── fotos/                # Fotos de usuarios

├── backups/                  # Respaldos automáticos---

├── logs/                     # Logs del sistema

├── dev.db                    # Base de datos SQLite## 🛠️ Instalación

├── .env                      # Variables de entorno

├── package.json              # Dependencias del proyecto### 1. Clonar el Repositorio

├── start-auto.ps1            # Script de inicio automatizado

├── stop-all.ps1              # Script de detención```bash

├── cleanup.ps1               # Script de limpiezagit clone https://github.com/tu-usuario/sistema-registro-institucional.git

├── check-data.js             # Verificar datos en BDcd sistema-registro-institucional

├── list-data.js              # Listar datos de prueba```

├── crear-admin.js            # Crear usuario admin

├── reset-password.js         # Resetear contraseña### 2. Instalar Dependencias del Backend

└── README.md

``````bash

npm install

## 📡 API Principal```



### Autenticación### 3. Instalar Dependencias del Frontend

- `POST /api/auth/login` - Iniciar sesión y obtener token JWT

```bash

### Personal (Docentes/Administrativos)cd frontend-react

- `GET /api/docentes` - Listar personalnpm install

- `GET /api/docentes/:id` - Obtener por IDcd ..

- `POST /api/docentes` - Crear miembro del personal```

- `PUT /api/docentes/:id` - Actualizar

- `DELETE /api/docentes/:id` - Eliminar### 4. Inicializar Base de Datos



**Categorías disponibles:** Director, Directora, Docente, Secretaria, Secretario, Operativo, Auxiliar```bash

# Generar cliente Prisma

### Alumnosnpx prisma generate

- `GET /api/alumnos` - Listar alumnos

- `GET /api/alumnos/:id` - Obtener por ID# Aplicar migraciones

- `POST /api/alumnos` - Crear alumnonpx prisma migrate dev --name init

- `PUT /api/alumnos/:id` - Actualizar```

- `DELETE /api/alumnos/:id` - Eliminar

### 5. (Opcional) Poblar con Datos de Prueba

### Códigos QR

- `POST /api/qr/generar` - Generar código QR```bash

- `GET /api/qr/:id/png` - Obtener imagen PNG del QRnode backend/prisma/seed.js

- `GET /api/qr/listar/todos` - Listar todos los QR```



### Asistencias---

- `POST /api/asistencias` - Registrar asistencia (entrada/salida)

- `GET /api/asistencias/hoy` - Asistencias del día actual## ⚙️ Configuración

- `GET /api/asistencias/stats` - Estadísticas de asistencia

- `GET /api/asistencias` - Listar con filtros### Variables de Entorno



### Diagnóstico y ReparaciónCrea un archivo `.env` en la raíz del proyecto:

- `GET /api/diagnostics/qrs` - Ejecutar diagnóstico completo

- `POST /api/repair/qrs/regenerate` - Regenerar códigos QR```env

- `POST /api/repair/auto` - Ejecutar auto-reparación manual# Base de Datos

DATABASE_URL="file:./dev.db"

## 🔧 Scripts Disponibles

# Seguridad

```powershellJWT_SECRET="tu_secreto_jwt_super_seguro_cambiame_en_produccion"

# SistemaHMAC_SECRET="tu_secreto_hmac_super_seguro_cambiame_en_produccion"

.\start-auto.ps1          # Iniciar (libera puertos automáticamente)

.\stop-all.ps1            # Detener todo# Servidor

.\cleanup.ps1             # Limpiar archivos temporalesPORT=5000

NODE_ENV=development

# Utilidades```

node check-data.js        # Verificar datos en la base de datos

node list-data.js         # Listar datos de prueba> ⚠️ **IMPORTANTE**: Cambia los secretos en producción. Usa valores aleatorios seguros.

node crear-admin.js       # Crear usuario administrador

node reset-password.js    # Resetear contraseña de usuario### Configuración de la Institución



# Backend (desde /backend)Al primer inicio, debes configurar los datos de tu institución:

npm run dev              # Desarrollo con nodemon (auto-restart)

npm start                # Producción```bash

npx prisma studio        # Abrir Prisma Studio (GUI para BD)POST http://localhost:5000/api/institucion/init

npx prisma generate      # Generar cliente PrismaContent-Type: application/json



# Frontend (desde /frontend-react){

npm run dev              # Servidor de desarrollo Vite  "nombre": "Tu Institución",

npm run build            # Build para producción  "horario_inicio": "07:00",

npm run preview          # Vista previa del build  "margen_puntualidad_min": 5,

```  "logo_base64": "data:image/png;base64,...",

  "admin_email": "admin@institucion.edu",

## ⚙️ Configuración  "admin_password": "Admin123!"

}

### Variables de Entorno (.env)```



```env---

# Base de Datos

DATABASE_URL="file:./dev.db"## 🎯 Uso



# Seguridad### Inicio Rápido (Windows - PowerShell)

JWT_SECRET="tu_secreto_super_seguro_cambiar_en_produccion_minimo_32_caracteres"

HMAC_SECRET="otro_secreto_para_hmac_cambiar_tambien_minimo_32_caracteres"```powershell

# Iniciar backend + frontend simultáneamente

# Administrador por defecto.\start-system.ps1

ADMIN_EMAIL="admin@colegio.edu"

ADMIN_PASSWORD="Admin123!"# Detener todos los servicios

.\stop-system.ps1

# Servidor```

PORT="5000"

NODE_ENV="development"### Inicio Manual



# Tareas Programadas**Terminal 1 - Backend:**

CRON_DIAGNOSTICS_INTERVAL="0 0 */6 * * *"  # Cada 6 horas```bash

BACKUP_BEFORE_REPAIR="true"cd backend

node server.js

# Logging```

LOG_LEVEL="info"

```**Terminal 2 - Frontend:**

```bash

⚠️ **IMPORTANTE:** Cambia los secretos en producción usando valores aleatorios seguros de al menos 32 caracteres.cd frontend-react

npm run dev

## 🔄 Sistema de Auto-Reparación```



El sistema ejecuta automáticamente cada 6 horas:### Acceso al Sistema



1. **Diagnóstico de códigos QR**- **Frontend React**: http://localhost:5173

   - Verifica existencia de archivos PNG- **API Backend**: http://localhost:5000

   - Detecta archivos corruptos (<1KB)- **Health Check**: http://localhost:5000/api/health

   - Valida tokens

### Credenciales Iniciales

2. **Regeneración Automática**

   - Regenera QR faltantes desde la base de datosPor defecto (después de ejecutar seed):

   - Recrea archivos corruptos- **Email**: `admin@test.edu`

   - Registra todas las acciones en auditoría- **Password**: `admin`



3. **Backup Automático**> ⚠️ **IMPORTANTE**: Cambia estas credenciales inmediatamente en producción.

   - Crea copia de seguridad después de cada reparación

   - Incluye base de datos y archivos uploads/---



4. **Notificaciones en Logs**## 📁 Estructura del Proyecto

   - Registra cada acción ejecutada

   - Permite monitoreo del estado del sistema```

sistema-registro-institucional/

## 📝 Cambios Recientes├── backend/

│   ├── prisma/

### v2.0 - Refactorización Docentes → Personal│   │   ├── schema.prisma      # Esquema de base de datos

│   │   ├── seed.js            # Datos de prueba

- ✅ Modelo de datos actualizado: `Docentes` → `Personal`│   │   └── dev.db             # Base de datos SQLite

- ✅ Campo `grado` → `categoria` con 7 opciones predefinidas│   ├── routes/                # Rutas de la API

- ✅ Dropdown en formulario con categorías: Director, Directora, Docente, Secretaria, Secretario, Operativo, Auxiliar│   │   ├── auth.js            # Autenticación

- ✅ Componente React renombrado: `DocentesPanel` → `PersonalPanel`│   │   ├── alumnos.js         # CRUD alumnos

- ✅ Terminología actualizada en toda la interfaz de usuario│   │   ├── docentes.js        # CRUD personal

- ✅ Migraciones de base de datos aplicadas correctamente│   │   ├── asistencias.js     # Registro asistencias

- ✅ Scripts de limpieza automatizados│   │   ├── qr.js              # Generación QR

- ✅ Eliminados 37+ archivos innecesarios (componentes duplicados, documentación antigua, scripts temporales)│   │   └── repair.js          # Auto-reparación

- ✅ Consolidación de scripts de inicio/detención│   ├── services/              # Lógica de negocio

│   │   ├── tokenService.js

### Archivos Eliminados en Limpieza│   │   ├── qrService.js

│   │   ├── diagnosticsService.js

- Componentes duplicados: `DocentesPanel.jsx`, `AlumnosPanel_OLD.jsx`, `AsistenciasPanel_OLD_ZXING.jsx`│   │   ├── repairService.js

- Frontend antiguo: carpeta `frontend/` completa│   │   └── backupService.js

- Scripts temporales: `generar-qrs-*.js`, `regenerar-qrs-*.js`│   ├── middlewares/

- Documentación redundante: 15 archivos .md consolidados│   │   └── auth.js            # Middleware JWT

- Archivos de prueba: `test*.js`, `check-*.js` innecesarios│   ├── jobs/

- Scripts duplicados: 7 scripts .ps1 de inicio/detención│   │   └── scheduler.js       # Tareas automatizadas

│   └── server.js              # Servidor principal

## 🛡️ Seguridad├── frontend-react/

│   ├── src/

- **Tokens HMAC**: Firmados con SHA256 + base64url│   │   ├── components/        # Componentes React

- **Contraseñas**: Encriptadas con bcrypt (10 rounds)│   │   │   ├── Dashboard.jsx

- **JWT**: Tokens con expiración configurable│   │   │   ├── AlumnosPanel.jsx

- **Validación**: Middleware de validación en todas las rutas│   │   │   ├── DocentesPanel.jsx

- **Rate Limiting**: Protección contra ataques de fuerza bruta│   │   │   ├── AsistenciasPanel.jsx

- **CORS**: Configurado para orígenes permitidos│   │   │   ├── ConfiguracionPanel.jsx

- **Auditoría**: Registro completo de todas las operaciones│   │   │   ├── DiagnosticsPanel.jsx

│   │   │   └── RepairPanel.jsx

## 📄 Licencia│   │   ├── pages/

│   │   │   └── LoginPage.jsx

MIT License│   │   ├── api/

│   │   │   ├── client.js      # Cliente Axios

Copyright (c) 2025 Kevin Gabriel Pérez García│   │   │   └── endpoints.js   # Configuración endpoints

│   │   ├── App.jsx

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia de este software y archivos de documentación asociados (el "Software"), para utilizar el Software sin restricciones.│   │   └── main.jsx

│   ├── vite.config.js

Ver el archivo [LICENSE](LICENSE) para más detalles.│   └── package.json

├── uploads/

## 🤝 Contribuir│   ├── qrs/                   # Códigos QR generados

│   ├── logos/                 # Logo institucional

Las contribuciones son bienvenidas. Por favor:│   └── fotos/                 # Fotos de usuarios

├── backups/                   # Respaldos automáticos

1. Fork el proyecto├── .env                       # Variables de entorno

2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)├── .gitignore

3. Commit tus cambios (`git commit -m 'Add: Nueva característica'`)├── LICENSE                    # Licencia MIT

4. Push a la rama (`git push origin feature/NuevaCaracteristica`)├── package.json

5. Abre un Pull Request├── start-system.ps1           # Script inicio Windows

├── stop-system.ps1            # Script detención Windows

### Guías de Contribución└── README.md

```

- Sigue el estilo de código existente

- Agrega tests para nuevas funcionalidades---

- Actualiza la documentación

- Asegúrate de que no haya errores con `npm run lint`## 📡 API Documentation



## 📞 Contacto### Autenticación



**Kevin Gabriel Pérez García**#### `POST /api/auth/login`

Iniciar sesión y obtener token JWT.

- GitHub: [@Hikki777](https://github.com/Hikki777)

- Repositorio: [asistencia-institucional](https://github.com/Hikki777/asistencia-institucional)**Request:**

```json

## 🙏 Agradecimientos{

  "email": "admin@test.edu",

- Comunidad de React  "password": "admin"

- Prisma por su excelente ORM}

- Tailwind CSS por el framework```

- Todas las librerías open source utilizadas

**Response:**

---```json

{

**Desarrollado con ❤️ por Kevin Gabriel Pérez García**  "success": true,

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
