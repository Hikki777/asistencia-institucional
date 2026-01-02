# Sistema de Registro Institucional - Estado del Proyecto

**Fecha:** 02 de enero de 2026
**Versión:** 1.0.0 (Release Candidate)
**Estado:** ✅ Estable y Operativo (Ready for Production)

---

## 🎯 Resumen del Sistema

Sistema integral de gestión institucional diseñado para controlar asistencias mediante códigos QR, administrar expedientes de alumnos y personal, gestionar justificaciones de ausencias, y proveer métricas en tiempo real. Construido sobre stack moderno (Node.js, React, Electron) con enfoque en estabilidad, rendimiento y facilidad de despliegue.

---

## ✅ Funcionalidades Implementadas (v1.0.0)

### 🖥️ Plataforma y Core
- **Aplicación de Escritorio:** Empaquetado con Electron v39 para Windows.
- **Setup Wizard:** Asistente de instalación inicial para configuración sin conocimientos técnicos.
- **Update System:** Sistema robusto de actualizaciones automáticas (`npm run update`) con Rollback integrado (`npm run rollback`).
- **Seguridad Reforzada:** Headers HTTP seguros, rate limiting, saneamiento de inputs, y protección contra inyección de scripts.
- **Offline First:** Banner de reconexión y cola de sincronización para operaciones críticas.

### 👥 Gestión de Usuarios
- **Alumnos:** Expediente completo, generación de carnet con QR, historial de asistencias.
- **Personal:** Gestión de docentes y administrativos con roles diferenciados.
- **Control de Acceso (RBAC):** Roles de Administrador (acceso total) y Operador (acceso limitado a toma de asistencia).

### ⏱️ Control de Asistencias
- **Scanner QR:** Lectura rápida mediante cámara web o lector físico.
- **Registro Manual:** Opción de respaldo para entrada manual.
- **Validación de Horarios:** Detección automática de retardos según configuración institucional.
- **Justificaciones (Excusas):** Módulo completo para gestionar ausencias médicas/familiares con flujo de aprobación.

### 📊 Análisis y Reportes
- **Dashboard en Tiempo Real:** Gráficos de asistencia diaria, puntualidad y ausentismo.
- **Métricas Avanzadas:** Análisis de tendencias semanales/mensuales.
- **Reportes Exportables:** Generación de Excel (.xlsx) y PDF para listados y estadísticas.

### 🔒 Infraestructura
- **Base de Datos:** SQLite local optimizada con WAL mode para rendimiento.
- **Backups Automáticos:** Sistema de respaldo cifrado (AES-256) de base de datos y archivos multimedia.
- **Logs Estructurados:** Sistema de logging (Pino) sin caracteres corruptos y rotación diaria.
- **Prevención de Errores:** Validación estricta de código (ESLint) y prevención de emojis problemáticos.

---

## 🔧 Cambios Recientes (Actualización v1.0)

### 1. Sistema de Actualización y Rollback
- Implementación de scripts CLI para facilitar el mantenimiento.
- **Update:** `npm run update` automatiza backup -> pull -> migraciones -> verficación.
- **Rollback:** `npm run rollback` permite volver a cualquier versión previa ante fallos.
- **Gestor de Migraciones:** Sistema incremental para cambios en base de datos.

### 2. Estabilidad de Electron
- Solución definitiva a bloqueos de inicio mediante aumento de memoria (1GB heap).
- Corrección de corrupción de logs en terminales Windows (codificación UTF-8 forzada).
- Renovación de UI en Setup Wizard y paneles principales.

### 3. Módulo de Justificaciones
- Activación del módulo de Excusas para gestión de ausencias.
- Integración completa con el expediente del alumno/personal.
- Corrección de bugs visuales y de importación.

### 4. Setup Wizard
- Flujo guiado para primera instalación.
- Configuración de institución y admin inicial.
- Validación de conexión y verificación de entorno.

---

## 📂 Estructura del Proyecto

```
Sistema de Registro Institucional/
├── backend/
│   ├── config/              ← Configuración y control de versiones
│   ├── migrations/          ← Scripts de migración de BD
│   ├── routes/              ← API Endpoints (Auth, Alumnos, Asistencias, Excusas...)
│   ├── services/            ← Lógica de negocio (QR, Reportes, Backup)
│   ├── prisma/              ← Esquema de BD y migraciones
│   └── server.js            ← Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── api/             ← Cliente Axios y puntos finales
│   │   ├── components/      ← Paneles (Alumnos, Personal, Config, Excusas...)
│   │   ├── pages/           ← Login, SetupWizard
│   │   └── App.jsx          ← Router principal
├── electron/                ← Configuración de la ventana nativa
├── scripts/                 ← Herramientas CLI (Update, Backup, Start, Validate)
├── backups/                 ← (Ignorado) Archivos .bak generados
├── uploads/                 ← (Ignorado) Fotos y logos almacenados
└── package.json             ← Dependencias y scripts
```

---

## 🚀 Guía de Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia Backend y Frontend en modo desarrollo |
| `npm run start` | Inicia el servidor en modo producción |
| `npm run electron` | Lanza la aplicación de escritorio |
| `npm run update` | **Actualiza el sistema** (Backup + Pull + Migrate) |
| `npm run rollback` | **Restaura una versión anterior** desde backup |
| `npm run validate:all` | Valida código y busca emojis prohibidos |
| `npm test` | Ejecuta pruebas unitarias e integración |

---

## 📋 Próximos Pasos (Roadmap v2.0)

El proyecto entra ahora en fase de estabilidad. Las siguientes funcionalidades están planificadas para la versión 2.0:

1.  **Gestión de Horarios (CNB Guatemala):**
    - Asignación de cargas académicas (periodos, materias).
    - Detección de conflictos de horario.
    - Soporte para mallas curriculares complejas.

2.  **Portal de Padres:**
    - Acceso web para consulta de notas y asistencia.

3.  **Notificaciones Push:**
    - Alertas en tiempo real a móviles.

4.  **Escalabilidad Cloud:**
    - Migración opcional a PostgreSQL para despliegues multi-sede.

---

## 📞 Soporte y Mantenimiento

Para reportar problemas o solicitar ayuda:
1.  Verificar logs en carpeta `logs/`.
2.  Ejecutar `npm run validate:all` para salud del código.
3.  Contactar al equipo de desarrollo.
