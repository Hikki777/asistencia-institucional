# 🎓 Sistema de Registro Institucional

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

> **Sistema de Control de Asistencias Moderno y Multiplataforma**
>
> Diseñado para instituciones educativas. Registro ágil mediante códigos QR, gestión de personal y despliegue híbrido (Local o Nube). Compatible con Windows, macOS y Linux.

---

## 🌟 Características

*   **🧙‍♂️ Setup Wizard**: Configuración inicial guiada sin tocar código
*   **📱 Registro QR**: Escaneo rápido mediante webcam
*   **🖥️ Panel Administrativo**: Dashboard moderno con gráficos en tiempo real
*   **👥 Gestión de Roles**: Administradores, Operadores y Visualizadores
*   **☁️ Arquitectura Híbrida**: Local (SQLite) o Nube (PostgreSQL + Cloudinary)

---

## 🛠️ Stack Tecnológico

| Área | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express, Prisma ORM, JWT |
| **Base de Datos** | SQLite (Dev) / PostgreSQL (Prod) |
| **Infraestructura** | Cloudinary (Media), Render/Railway (Hosting) |

---

## 🚀 Instalación

### 1. Requisitos
*   Node.js v18+
*   npm v9+
*   Git

### 2. Clonar e Instalar
```bash
git clone https://github.com/Hikki777/asistencia-institucional.git
cd asistencia-institucional

# Instalar dependencias (backend y frontend)
npm install
cd frontend-react
npm install
cd ..

# Generar cliente de base de datos
npx prisma generate
```

### 3. Iniciar el Sistema
```bash
# Inicia Backend (Puerto 5000) y Frontend (Puerto 5173) simultáneamente
npm run dev
```

### 4. Configuración Inicial
1.  Abre **http://localhost:5173**
2.  El **Setup Wizard** se iniciará automáticamente
3.  Configura tu institución y crea el usuario Administrador

> **Nota**: No existen credenciales por defecto. Tú defines tu acceso durante el Setup.

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia backend + frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Base de Datos
npm run seed             # Poblar con datos de prueba
npm run prisma:studio    # Abrir Prisma Studio (UI)

# Testing
npm test                 # Ejecutar tests

# Utilidades
npm run utils            # CLI de utilidades del sistema
npm run admin            # Crear usuario admin (emergencia)
```

---

## 📂 Documentación

*   **[GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)**: Despliegue en producción (Neon/Supabase + Render/Vercel)
*   **[ESTADO_DEL_PROYECTO.md](./ESTADO_DEL_PROYECTO.md)**: Roadmap y detalles técnicos
*   **[PANEL_METRICAS.md](./PANEL_METRICAS.md)**: Manual del panel de monitoreo

---

## 🤝 Contribución

Este proyecto es **Software Libre** bajo licencia **GNU GPLv3**.
Las Pull Requests son bienvenidas.

**Autor**: [Kevin Pérez (@Hikki777)](https://github.com/Hikki777)

---

**⭐ Si este proyecto te sirve, ¡dale una estrella en GitHub!**
