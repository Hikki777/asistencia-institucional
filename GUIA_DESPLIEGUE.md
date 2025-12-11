# 🚀 Guía de Despliegue - Sistema de Registro Institucional

Esta guía detalla paso a paso cómo desplegar el sistema completo en servicios de nube gratuitos o de bajo costo.

---

## 📋 Requisitos Previos

- Cuenta en **GitHub** (para el código).
- Cuenta en **Neon Tech** o **Supabase** (para Base de Datos PostgreSQL).
- Cuenta en **Cloudinary** (para almacenamiento de imágenes).
- Cuenta en **Render** o **Railway** (para el Backend).
- Cuenta en **Firebase** o **Vercel** (para el Frontend).
- **Node.js** y **NPM** instalados localmente.

---

## 1. Base de Datos (PostgreSQL)

Utilizaremos **Neon Tech** (recomendado) o Supabase por su excelente capa gratuita.

1. Crear un nuevo proyecto en [Neon.tech](https://neon.tech).
2. Obtener la **Connection String** (URL de conexión).
3. Asegurarse de que la URL tenga el formato `postgres://...` o `postgresql://...`.
4. Guardar esta URL, será nuestra `DATABASE_URL`.

---

## 2. Almacenamiento (Cloudinary)

Necesario para guardar las fotos de alumnos y personal en la nube.

1. Registrarse en [Cloudinary](https://cloudinary.com/).
2. Ir al **Dashboard** y copiar:
    - `Cloud Name`
    - `API Key`
    - `API Secret`
3. Estas credenciales se usarán en las variables de entorno del Backend.

---

## 3. Backend (Render.com)

1. Crear un nuevo **Web Service** en Render conectado a tu repositorio GitHub.
2. Seleccionar la carpeta raíz del repositorio (o especificar `backend` si Render lo pide, pero el `package.json` raíz maneja todo).
3. **Configuración de Build y Start**:
    - **Build Command:** `npm install && npx prisma generate`
    - **Start Command:** `npm start`
4. **Variables de Entorno (Environment Variables):**
    Agrega las siguientes variables en el panel de Render:
    - `NODE_ENV`: `production`
    - `PORT`: `5000` (o dejar que Render asigne uno)
    - `DATABASE_URL`: (Tu URL de Neon/Supabase del paso 1)
    - `JWT_SECRET`: (Genera una clave segura aleatoria)
    - `HMAC_SECRET`: (Genera otra clave segura aleatoria)
    - `CLOUDINARY_CLOUD_NAME`: (Tu Cloud Name)
    - `CLOUDINARY_API_KEY`: (Tu API Key)
    - `CLOUDINARY_API_SECRET`: (Tu API Secret)
5. **Desplegar**. Render iniciará el servicio. Copia la URL que te asignen (ej: `https://mi-backend.onrender.com`).

---

## 4. Frontend (Vercel o Firebase)

### Opción A: Vercel (Más sencillo)
1. Importar el proyecto en Vercel desde GitHub.
2. Configurar el **Root Directory** a `frontend-react`.
3. Vercel detectará Vite automáticamente.
4. **Variables de Entorno**:
    - `VITE_API_URL`: (La URL de tu backend en Render, ej: `https://mi-backend.onrender.com/api`)
5. **Desplegar**.

### Opción B: Firebase Hosting
1. Asegurarse de tener `firebase-tools` instalado.
2. Ejecutar `firebase login` en tu terminal.
3. Ejecutar `firebase init hosting` en la raíz.
    - Seleccionar `frontend-react/dist` como directorio público.
    - Configurar como Single Page App (Yes).
4. Construir el frontend con la URL del backend de producción:
    Linux/Mac:
    ```bash
    export VITE_API_URL=https://tu-backend.onrender.com/api
    npm run build:frontend
    ```
    Windows (PowerShell):
    ```powershell
    $env:VITE_API_URL="https://tu-backend.onrender.com/api"
    npm run build:frontend
    ```
5. Desplegar: `firebase deploy`.

---

## 5. Post-Despliegue

Una vez que ambos servicios estén activos:

1. **Ejecutar Migraciones en Producción**:
   Desde tu máquina local, conecta Prisma a la BD de producción para crear las tablas:
   ```bash
   # En tu .env local temporalmente pon la DATABASE_URL de producción
   npx prisma migrate deploy
   ```

2. **Crear Usuario Admin**:
   Puedes acceder a la URL del backend `/api/health` para verificar que responde.
   Para crear el primer usuario, deberás conectarte a la base de datos (usando Tablesplus o DBeaver con la URL de Neon) e insertar un usuario manualmente en la tabla `usuarios`, o usar el script `crear-admin.js` apuntando a la BD de producción.

---

## 🆘 Solución de Problemas

- **Error CORS**: Si el frontend no puede hablar con el backend, verifica que el backend tenga configurado los origenes permitidos o usa `*` temporalmente en `server.js` si es necesario (no recomendado para prod).
- **Imágenes rotas**: Verifica las credenciales de Cloudinary.
- **Base de datos**: Asegúrate de que `prisma generate` se ejecute en el Build Command de Render.
