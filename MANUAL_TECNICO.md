# 📘 Manual Técnico - Sistema de Registro Institucional

**Versión:** 1.0.0  
**Fecha:** 02 de Enero, 2026  
**Stack:** Electron + React + Node.js + SQLite

Este documento describe la arquitectura, instalación y mantenimiento del sistema para personal de TI.

---

## 1. 🏗️ Arquitectura del Sistema

El sistema es una aplicación híbrida que puede funcionar como Desktop App (Electron) o Servidor Web en red local.

### Componentes
1.  **Backend (Node.js + Express):**
    -   API RESTful puerto `5000`.
    -   Manejo de lógica de negocio, autenticación JWT, y acceso a datos.
    -   Orquestación de backups y sistema de archivos.

2.  **Frontend (React + Vite):**
    -   Interfaz de usuario puerto `5173`.
    -   Comunicación con backend vía Axios.
    -   Gestión de estado local y routing.

3.  **Base de Datos (SQLite):**
    -   Archivo local `backend/prisma/dev.db`.
    -   Modo WAL (Write-Ahead Logging) habilitado para alto rendimiento y concurrencia.
    -   Gestionado vía Prisma ORM.

4.  **Electron Wrapper:**
    -   Contenedor nativo que gestiona los procesos de Node y ventana de navegador.

---

## 2. ⚙️ Requisitos del Sistema (Servidor/Cliente)

-   **OS:** Windows 10/11 (64-bit), macOS (Catalina 10.15+) o Linux (Ubuntu 20.04+).
-   **Node.js:** v18.17.0 o superior
-   **RAM:** 4GB o más
-   **Espacio:** 10GB o más
-   **Git:** Para control de versiones y actualizaciones.

---

## 3. 🚀 Instalación y Despliegue

### Instalación Limpia
1.  **Clonar Repositorio:**
    ```bash
    git clone https://github.com/Hikki777/asistencia-institucional.git
    cd asistencia-institucional
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

3.  **Primer Inicio (Setup Wizard):**
    Ejecuta el sistema. Se abrirá automáticamente el asistente de instalación para crear la base de datos inicial y el usuario administrador.
    ```bash
    npm run dev
    ```

---

## 4. 🛠️ Comandos de Mantenimiento

El sistema incluye scripts automatizados en `package.json` para facilitar la gestión.

### ▶️ Ejecución
-   `npm run dev`: Modo desarrollo (logs detallados).
-   `npm run electron`: Inicia la aplicación de escritorio (producción).

### 🔄 Actualizaciones (Critical)
Para actualizar el sistema a una nueva versión descargada del repositorio:
```bash
npm run update
```
**Proceso Automático:**
1.  Crea un **Backup Cifrado** del sistema actual en `backups/`.
2.  Ejecuta `git pull` para bajar cambios.
3.  Instala nuevas dependencias (`npm install`).
4.  Ejecuta migraciones de base de datos pendientes.
5.  Si falla, hace **Rollback Automático**.

### ↩️ Restauración (Rollback)
Si una actualización corrompe el sistema, puedes volver a una versión anterior:
```bash
npm run rollback
```
Selecciona el archivo `.bak` deseado de la lista interactiva.

### 🧪 Validación de Código
Para desarrolladores, verifica que no haya errores de sintaxis o emojis prohibidos:
```bash
npm run validate:all
```

---

## 5. 📂 Estructura de Archivos

```
/
├── backend/            # API Server
│   ├── config/         # Versionado (version.json)
│   ├── migrations/     # Lógica de migración BD
│   ├── prisma/         # Schema y DB (dev.db)
│   ├── routes/         # Endpoints
│   └── server.js       # Entry point
├── frontend/           # React App
├── electron/           # Main process Electron
├── scripts/            # CLI Tools (update, backup, start)
├── backups/            # Almacenamiento local de respaldos
├── uploads/            # Fotos de perfil y logos
└── package.json        # Manifest
```

---

## 6. 🔒 Seguridad y Backups

### Cifrado de Backups
Los backups generados (`.bak`) son archivos ZIP cifrados con AES-256. Contienen:
-   Base de datos (`dev.db`).
-   Carpeta `uploads/` (multimedia).
-   Carpeta `config/`.

### Variables de Entorno
El sistema maneja las claves sensibles internamente o vía `.env`.
-   `JWT_SECRET`: Firma de tokens.
-   `HMAC_SECRET`: Verificación de integridad de backups.

---

## 7. 🐛 Solución de Problemas

**Error: "Database is locked"**
SQLite está ocupado. Generalmente se resuelve solo en milisegundos. Si persiste, reinicia el servicio backend.

**Error: "EADDRINUSE" (Puerto ocupado)**
El puerto 5000 o 5173 está en uso. El script de inicio intenta liberarlos automáticamente. Si falla, cierra procesos Node en el Administrador de Tareas.

**Interfaz en blanco o error de carga**
Verifica que ambos servidores (Backend y Frontend) estén corriendo en la terminal. Usa `npm run dev` para ver logs en tiempo real.
