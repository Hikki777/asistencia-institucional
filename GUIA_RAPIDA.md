# 🎓 Sistema de Registro Institucional - Guía Rápida

> Sistema completo de control de asistencias con códigos QR dinámicos, auto-reparación y panel administrativo React.

## 🚀 Inicio Rápido (< 2 minutos)

### 1. Levantar el sistema

**Opción A: En la terminal integrada de VS Code (recomendado)**

```powershell
# Backend + Frontend como Jobs (sin abrir ventanas)
cd frontend-react
Start-Job -Name Backend -ScriptBlock { 
  Set-Location "c:\Users\Kevin\Documents\Proyectos\Gestión de Asistencias\asistencias-qr"
  node backend/server.js 
}
Start-Job -Name Frontend -ScriptBlock { 
  Set-Location "c:\Users\Kevin\Documents\Proyectos\Gestión de Asistencias\asistencias-qr\frontend-react"
  npm run dev
}

# Ver estado
Get-Job
```

**Opción B: Dos terminales separadas**

Terminal 1:
```bash
node backend/server.js
```

Terminal 2:
```bash
cd frontend-react
npm run dev
```

### 2. Acceder al sistema

- **Panel Admin:** <http://localhost:5173>
- **API Backend:** <http://localhost:5000/api/health>

**Credenciales:**
- Email: `admin@test.edu`
- Password: `admin`

### 3. Detener servicios (si usaste Jobs)

```powershell
Stop-Job -Name Backend,Frontend
Remove-Job -Name Backend,Frontend
```

## ✅ Estado Actual

- ✅ Backend con JWT funcionando (rutas protegidas)
- ✅ Frontend React con login y dashboard
- ✅ Autenticación completa (login/logout/perfil)
- ✅ CRUD de alumnos protegido
- ✅ Diagnóstico y reparación de QRs
- ✅ Scheduler automático (cada 6h)
- ✅ Backups diarios (2 AM)

## 📚 Documentación Completa

- **Estado del Sistema:** [ESTADO_SISTEMA_COMPLETADO.md](./ESTADO_SISTEMA_COMPLETADO.md)
- **API Reference:** [README.md](./README.md) (documentación original)
- **Diagnóstico/Reparación:** [DIAGNOSTICO_Y_REPARACION.md](./DIAGNOSTICO_Y_REPARACION.md)
- **Frontend React:** [frontend-react/README.md](./frontend-react/README.md)

## 🧪 Tests

```bash
# Tests básicos (8 pruebas)
node test.js

# Tests de autenticación (5 pruebas)
node test-auth.js

# Test de integración
node integration-test.js
```

Todos: **PASS ✅**

## 🔑 Utilidades

```bash
# Ver usuario admin actual
node check-user.js

# Resetear contraseña a "admin"
node reset-password.js

# Abrir Prisma Studio (UI para BD)
npm run prisma:studio
```

## 📊 Estructura del Proyecto

```
asistencias-qr/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── middlewares/       # auth.js (JWT)
│   ├── routes/            # API routes (protegidas)
│   ├── services/          # Lógica de negocio
│   └── prisma/            # Schema + BD
├── frontend-react/        # UI React + Vite
│   ├── src/
│   │   ├── components/    # Dashboard, Alumnos, etc.
│   │   ├── pages/         # LoginPage
│   │   └── api/           # Axios client
├── uploads/               # QRs + logos generados
├── backups/               # Backups automáticos
├── test.js                # Tests backend
├── test-auth.js           # Tests JWT
└── .env                   # Config
```

## 🎯 Próximos Pasos Sugeridos

1. **UI/UX:**
   - Paginación + búsqueda en tabla de alumnos
   - Toasts para success/error
   - Loading skeletons
   - Validación de formularios

2. **Funcionalidades:**
   - Gestión de QR en UI (ver/descargar individual)
   - Export/Import alumnos (CSV/XLSX)
   - Panel de Personal
   - Roles (admin vs operador)

3. **Producción:**
   - Build de Vite y servir desde Express
   - Docker Compose
   - Variables de entorno seguras
   - HTTPS

Ver lista completa en [ESTADO_SISTEMA_COMPLETADO.md](./ESTADO_SISTEMA_COMPLETADO.md)

## 🛠️ Stack Tecnológico

**Backend:** Node.js, Express, Prisma, SQLite, JWT, bcrypt, node-cron, QRCode, Sharp  
**Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS, Framer Motion

---

**¿Dudas?** Consulta la documentación completa o ejecuta los tests para validar el sistema.

**Sistema listo para desarrollo** ✅
