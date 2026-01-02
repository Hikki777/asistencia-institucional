# Sistema de Registro Institucional (HikariOpen)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![Electron](https://img.shields.io/badge/Electron-v39-AE2.svg) ![React](https://img.shields.io/badge/React-18-61DAFB.svg) ![Node](https://img.shields.io/badge/Node-18%2B-339933.svg) ![Status](https://img.shields.io/badge/Status-Stable-success.svg)

Sistema integral para la gestión de instituciones educativas, enfocado en el control de asistencia mediante códigos QR, gestión de expedientes académicos y estadísticas en tiempo real. Diseñado para ofrecer una experiencia moderna, segura y eficiente.

---

## ✨ Características Principales

- **📱 Control de Asistencia QR:** Registro rápido de entrada/salida para alumnos y personal con detección de retardos.
- **bust Gestión Académica:** Expedientes digitales completos, generación de carnets y roles de usuario.
- **📊 Dashboard Interactivo:** Métricas en tiempo real sobre asistencia, puntualidad y ausentismo.
- **📝 Justificaciones:** Módulo nativo para gestionar excusas y permisos (médicos, familiares).
- **🔒 Seguridad Corporativa:** Roles de acceso (Admin/Operador), backups cifrados y auditoría.
- **🚀 Actualizaciones Seguras:** Sistema integrado de update y rollback automático.
- **🖥️ Aplicación de Escritorio:** Experiencia nativa con Electron para Windows.

---

## 🛠️ Requisitos Previos

- **Node.js:** v18.0.0 o superior.
- **Git:** Para control de versiones.
- **Sistema Operativo:** Windows 10/11 (Recomendado), macOS o Linux.

---

## 📦 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Hikki777/asistencia-institucional.git
    cd asistencia-institucional
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

3.  **Configuración Inicial:**
    - El sistema incluye un **Setup Wizard** que se ejecutará la primera vez que inicies la aplicación.
    - No es necesario configurar manualmente el `.env` para desarrollo local (SQLite).

---

## ▶️ Uso y Comandos

### Iniciar Desarrollo
Para levantar backend y frontend simultáneamente:
```bash
npm run dev
```

### Iniciar Aplicación de Escritorio
Para abrir la versión Electron (producción):
```bash
npm run electron
```

### Mantenimiento y Actualizaciones
El sistema incluye herramientas CLI para facilitar la gestión:

- **Actualizar Sistema:**
  ```bash
  npm run update
  ```
  *(Crea backup automático, descarga cambios y aplica migraciones)*

- **Restaurar Versión Anterior:**
  ```bash
  npm run rollback
  ```
  *(Restaura la base de datos y archivos desde un backup previo)*

- **Validar Código:**
  ```bash
  npm run validate:all
  ```

---

## 📂 Estructura de Carpetas

- `/backend`: Servidor API (Express), Base de Datos y Lógica.
- `/frontend`: Interfaz de Usuario (React + Vite).
- `/electron`: Configuraciones específicas de la app de escritorio.
- `/scripts`: Herramientas de automatización (Update, Backup, Start).
- `/backups`: Almacenamiento local de respaldos (No se sube a Git).
- `/uploads`: Archivos multimedia de usuarios (No se sube a Git).

---

## 🤝 Contribución

1.  Hacer Fork del repositorio.
2.  Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`).
3.  Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abrir un Pull Request.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

---
**Desarrollado por Kevin Pérez**
