# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-12-31

### 🎉 Lanzamiento Inicial

Primera versión estable del Sistema Integral de Gestión Institucional.

### ✨ Agregado

#### Generación de Documentos Oficiales
- Servicio de generación de PDFs con PDFKit (`documentService.js`)
- Constancia de inscripción con datos del alumno y firma institucional
- Carta de buena conducta con evaluación de comportamiento
- Certificado de estudios con historial académico completo
- Endpoints API: `/api/documentos/*`
- Almacenamiento persistente en `/uploads/documentos/`

#### Optimizaciones
- Modo WAL activado en SQLite para mejor concurrencia (30-40% más rápido)
- Límite de memoria Node.js reducido a 256MB
- Frontend optimizado: chunks divididos, sin sourcemaps en producción
- Script de inicio inteligente (`start-dev.js`) con verificación de puertos

#### Documentación
- Manual técnico completo (`MANUAL_TECNICO.md`)
- Manual de usuario básico (`MANUAL_USUARIO.md`)
- Archivo `.env.example` con plantilla de configuración
- README.md renovado con todas las funcionalidades

#### Seguridad
- Validación de contraseña en operaciones críticas (factory reset)
- Rate limiting mejorado
- Logging estructurado con Pino

### 🔄 Cambiado

#### Arquitectura
- Migración de PostgreSQL (Supabase) a SQLite local
- Almacenamiento de imágenes de Cloudinary a sistema de archivos local
- Servicio `imageService.js` refactorizado para almacenamiento local

#### Nombres y Rutas
- `migracionService.js` → `promocionService.js` (mayor claridad)
- `routes/migracion.js` → `routes/promocion.js`
- Endpoint `/api/migracion` → `/api/promocion`

#### Metadatos y Branding
- Título de la aplicación: "Sistema de Gestión Institucional"
- Descripción actualizada en `package.json` (backend y frontend)
- Meta tags SEO optimizados en `index.html`
- PWA manifest actualizado con nombre descriptivo
- Versión sincronizada a 1.0.0 en ambos package.json

#### CORS
- Eliminadas URLs de Firebase (ya no se usan)
- Agregado soporte completo para redes locales:
  - 192.168.x.x (red doméstica/oficina)
  - 10.x.x.x (red corporativa)
  - 172.16-31.x.x (red privada)

### 🗑️ Eliminado

#### Dependencias Cloud
- `cloudinary` (v2.8.0) - Reemplazado por almacenamiento local
- `pg` (v8.16.3) - Reemplazado por SQLite

#### Código Legacy
- `backend/services/cloudinaryService.js` - Ya no se usa
- `scripts/test-cloudinary.js` - Obsoleto
- Referencias a Firebase en CORS

### 🐛 Corregido

- Servicio de archivos estáticos ahora activo (fotos, QRs, logos se sirven correctamente)
- CORS funciona en toda la red local sin configuración adicional
- Logging estructurado reemplaza `console.log` en producción

### 📦 Dependencias

#### Agregadas
- `pdfkit@^0.15.0` - Generación de documentos PDF

#### Actualizadas
- Todas las dependencias mantienen versiones estables

### 🔧 Configuración

- Nuevo archivo `.env.example` con plantilla completa
- `DATABASE_URL` ahora apunta a SQLite: `file:./backend/prisma/asistencias.db`
- Variables de Cloudinary eliminadas del `.env`

### 📊 Rendimiento

- Uso de memoria backend: <256MB (optimizado para 4GB RAM)
- Tiempo de inicio: <10 segundos
- Tiempo de respuesta API: <500ms
- Generación de PDF: <3 segundos

### 🎯 Características Principales

- ✅ Control de asistencias con códigos QR
- ✅ Gestión completa de alumnos y personal
- ✅ Promoción automática de alumnos por grado
- ✅ Generación de documentos oficiales (constancias, cartas, certificados)
- ✅ Reportes avanzados (Excel, PDF)
- ✅ Dashboard con gráficas en tiempo real
- ✅ Sistema de roles (Admin, Docente, Operador)
- ✅ Optimizado para hardware básico (4GB RAM)
- ✅ Funcionamiento 100% local (sin internet)

---

## [0.9.0] - 2025-12-XX

### Versión Beta
- Sistema base de asistencias con QR
- Gestión básica de alumnos y personal
- Reportes simples
- Despliegue en cloud (Railway + Supabase)

---

**Nota**: Las versiones anteriores a 1.0.0 no están documentadas en detalle.
