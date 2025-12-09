# 🎓 Sistema de Registro Institucional

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Hikki777/asistencia-institucional/pulls)

> Sistema completo de gestión de asistencias para instituciones educativas con códigos QR, panel administrativo React y auto-reparación automática.

---

## ✨ Características Principales

- 📱 **Registro con QR**: Escaneo mediante webcam para registro rápido
- ✍️ **Entrada Manual**: Sistema alternativo de búsqueda y selección
- 👥 **Gestión Completa**: CRUD de alumnos y personal
- 📊 **Dashboard en Tiempo Real**: Estadísticas, gráficos y métricas
- 📈 **Panel de Métricas**: Monitoreo de rendimiento con gráficos interactivos
- 🖨️ **Impresión de QR**: Generador de tarjetas profesionales
- 🔐 **Autenticación JWT**: Sistema seguro con tokens de 8 horas
- 🔄 **Auto-Reparación**: Diagnóstico automático cada 6 horas
- 💾 **Backups Automáticos**: Respaldos diarios a las 2 AM
- 🛡️ **Rate Limiting**: Protección contra abuso de API
- 📝 **Logs Estructurados**: Sistema de logging con Pino

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js v18.0.0 o superior
- npm v9.0.0 o superior  
- Windows 10/11, macOS, o Linux

### Instalación

```powershell
# 1. Clonar el repositorio
git clone https://github.com/Hikki777/asistencia-institucional.git
cd asistencia-institucional

# 2. Instalar dependencias del backend
npm install

# 3. Instalar dependencias del frontend
cd frontend-react
npm install
cd ..

# 4. Generar cliente Prisma
npx prisma generate

# 5. Aplicar migraciones
npx prisma migrate deploy

# 6. (Opcional) Poblar con datos de prueba
npm run seed

# 7. Crear usuario administrador
npm run admin
```

### Iniciar el Sistema

**Opción 1: Con Monitor y Auto-Reparación** (Recomendado)
```powershell
.\start-with-monitor.ps1
```
- ✅ Monitorea salud cada 30 segundos
- ✅ Reinicia automáticamente si falla
- ✅ Dashboard en tiempo real
- ✅ Logs detallados

**Opción 2: Inicio Rápido**
```powershell
.\start-auto-simple.ps1
```
- ⚡ Inicio rápido sin monitor
- 🔇 Servicios en segundo plano

**Detener el Sistema:**
```powershell
.\stop-all.ps1
```

### Acceder al Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Métricas:** http://localhost:5000/api/metrics

**Credenciales por defecto:**
- Email: `admin@test.edu`
- Contraseña: `admin123`

---

## 📖 Documentación

- **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Guía de inicio paso a paso
- **[GUIA_RAPIDA.md](./GUIA_RAPIDA.md)** - Guía de uso del sistema
- **[ESTADO_DEL_PROYECTO.md](./ESTADO_DEL_PROYECTO.md)** - Estado completo del proyecto
- **[SCRIPTS_README.md](./SCRIPTS_README.md)** - Documentación de scripts
- **[PANEL_METRICAS.md](./PANEL_METRICAS.md)** - Panel de métricas visual
- **[VALIDACION_SISTEMA.md](./VALIDACION_SISTEMA.md)** - Tests y validación

---

## 🛠️ Tecnologías

### Backend
- **Node.js** + Express.js
- **Prisma ORM** + SQLite
- **JWT** para autenticación
- **Pino** para logging estructurado
- **QRCode** para generación de códigos
- **Sharp** para procesamiento de imágenes
- **ExcelJS** + PDFKit para reportes
- **Helmet** + CORS para seguridad
- **Express Rate Limit** para protección

### Frontend
- **React 18** + Vite 5
- **Tailwind CSS** para estilos
- **Recharts** para gráficos
- **Framer Motion** para animaciones
- **Axios** para API requests
- **React Router** para navegación
- **React Hot Toast** para notificaciones
- **Html5-qrcode** para escaneo QR
- **Lucide React** para iconos

### DevOps
- **Jest** + Supertest para testing
- **ESLint** + Prettier para calidad de código
- **PowerShell** scripts para automatización
- **Node-cron** para tareas programadas

---

## 📜 Scripts Disponibles

### Scripts npm

```bash
# Desarrollo
npm run dev                    # Iniciar backend
npm run dev:nodemon            # Backend con nodemon
npm run dev:frontend           # Iniciar frontend

# Tests
npm test                       # Ejecutar todos los tests
npm run test:watch             # Tests en modo watch
npm run test:integration       # Tests de integración

# Base de datos
npm run seed                   # Poblar con datos de prueba
npm run prisma:studio          # Abrir Prisma Studio
npm run prisma:push            # Push schema a DB
npm run prisma:reset           # Reset migrations

# Utilidades
npm run utils                  # CLI de utilidades
npm run admin                  # Crear usuario admin
```

### Scripts PowerShell

```powershell
.\start-with-monitor.ps1       # Inicio con auto-reparación
.\start-auto-simple.ps1        # Inicio simple
.\stop-all.ps1                 # Detener servicios
```

### CLI de Utilidades

```bash
node utils.js list             # Resumen del sistema
node utils.js alumnos          # Listar alumnos
node utils.js personal         # Listar personal
node utils.js asistencias-hoy  # Asistencias de hoy
node utils.js qrs              # Estado de QRs
node utils.js health           # Salud del sistema
node utils.js help             # Ayuda
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="tu_secreto_jwt_aqui_cambiar_en_produccion"
HMAC_SECRET="tu_secreto_hmac_aqui_cambiar_en_produccion"
PORT=5000
NODE_ENV=development
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm test -- --coverage

# Tests en modo watch
npm run test:watch

# Tests de integración
npm run test:integration
```

**Cobertura actual:** 12.37%  
**Tests:** 13/13 passing

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Kevin Gabriel Pérez García**

- GitHub: [@Hikki777](https://github.com/Hikki777)
- Proyecto: [asistencia-institucional](https://github.com/Hikki777/asistencia-institucional)

---

**⭐ Si este proyecto te ayudó, considera darle una estrella en GitHub!**
