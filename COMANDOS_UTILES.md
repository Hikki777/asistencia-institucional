# ⚡ Comandos Útiles - Sistema de Registro Institucional

## 🚀 Inicio y Detención

### Opción Recomendada: Scripts Automáticos

```powershell
# Iniciar todo (backend + frontend)
.\start-system.ps1

# Detener todo
.\stop-system.ps1
```

### Opción Manual: Dos Terminales

**Terminal 1 - Backend:**
```bash
node backend/server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm run dev
```

### Opción PowerShell Jobs (sin ventanas)

```powershell
# Iniciar como jobs
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

# Ver logs
Receive-Job -Name Backend -Keep | Select-Object -Last 50
Receive-Job -Name Frontend -Keep | Select-Object -Last 50

# Detener
Stop-Job -Name Backend,Frontend
Remove-Job -Name Backend,Frontend
```

---

## 🧪 Tests

```bash
# Tests backend básicos (8 pruebas)
node test.js

# Tests de autenticación JWT (5 pruebas)
node test-auth.js

# Tests de integración (backend + frontend)
node integration-test.js
```

**Todos los tests deben mostrar:** ✅ PASS

---

## 🔧 Utilidades

### Ver Usuario Admin

```bash
node check-user.js
```

**Salida esperada:**
```
✅ Usuario encontrado en BD:
   ID: 1
   Email: admin@test.edu
   Rol: admin
   Activo: true
```

### Resetear Contraseña

```bash
node reset-password.js
```

Regenera el hash de `admin` en la BD si hubo problemas de autenticación.

### Prisma Studio (UI para BD)

```bash
npm run prisma:studio
```

Abre interfaz web en http://localhost:5555 para ver/editar la base de datos SQLite.

---

## 🌐 URLs del Sistema

| Servicio | URL | Notas |
|----------|-----|-------|
| Frontend | http://localhost:5173 | Panel administrativo React |
| Backend | http://localhost:5000 | API REST |
| Health Check | http://localhost:5000/api/health | Verifica estado del backend |
| Login API | http://localhost:5000/api/auth/login | POST con email/password |
| Prisma Studio | http://localhost:5555 | Solo si ejecutas `npm run prisma:studio` |

---

## 🔐 Credenciales

**Usuario Admin por Defecto:**
```
Email:    admin@test.edu
Password: admin
Rol:      admin
```

⚠️ **Cambiar para producción.**

---

## 📊 Verificación de Estado

### Backend Health Check

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

**Respuesta esperada:** `200 OK` con `{"status":"ok"}`

### Frontend Accesible

```powershell
Invoke-WebRequest -Uri http://localhost:5173
```

**Respuesta esperada:** `200 OK`

### Ver Procesos Node

```powershell
Get-Process -Name node
```

### Ver Puertos en Uso

```powershell
# Backend (puerto 5000)
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

# Frontend (puerto 5173)
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
```

---

## 🐛 Troubleshooting

### Backend no responde

```powershell
# 1. Verificar que está corriendo
Get-Process -Name node

# 2. Ver logs (si es job)
Receive-Job -Name Backend -Keep | Select-Object -Last 100

# 3. Reiniciar manualmente
Get-Process -Name node | Stop-Process -Force
node backend/server.js
```

### Frontend no carga

```powershell
# 1. Verificar puerto
Get-NetTCPConnection -LocalPort 5173

# 2. Ver logs (si es job)
Receive-Job -Name Frontend -Keep | Select-Object -Last 100

# 3. Reiniciar manualmente
cd frontend-react
npm run dev
```

### Login falla (401 Unauthorized)

```bash
# Verificar usuario
node check-user.js

# Resetear contraseña
node reset-password.js

# Reintentar login
```

### "Cannot find module"

```bash
# Backend
npm install

# Frontend
cd frontend-react
npm install
```

### Puerto ocupado

```powershell
# Ver qué proceso ocupa el puerto 5000
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Get-Process -Id $_.OwningProcess }

# Matar proceso específico
Stop-Process -Id <PID> -Force

# Matar todos los Node
Get-Process -Name node | Stop-Process -Force
```

---

## 🔄 Reiniciar desde Cero

```bash
# 1. Detener todo
.\stop-system.ps1

# 2. (Opcional) Limpiar BD y backups
Remove-Item backend/prisma/dev.db -Force
Remove-Item backups/* -Recurse -Force
Remove-Item uploads/qrs/* -Recurse -Force

# 3. Reinicializar BD
npx prisma db push

# 4. (Opcional) Seed con datos de prueba
node backend/prisma/seed.js

# 5. Iniciar
.\start-system.ps1
```

---

## 📝 Comandos Git (Opcional)

```bash
# Ver cambios
git status

# Commit de avances
git add .
git commit -m "feat: implementar autenticación JWT y panel React"

# Push (si tienes repo remoto)
git push origin main
```

---

## 🎯 Flujo de Trabajo Típico

### Día a Día

1. **Iniciar sistema:**
   ```powershell
   .\start-system.ps1
   ```

2. **Abrir navegador:**
   - http://localhost:5173
   - Login: `admin@test.edu` / `admin`

3. **Desarrollar:**
   - Editar archivos en VS Code
   - Frontend hot-reload automático (Vite)
   - Backend requiere restart manual

4. **Probar cambios:**
   ```bash
   node test.js
   node test-auth.js
   ```

5. **Al terminar:**
   ```powershell
   .\stop-system.ps1
   ```

### Agregando Nueva Feature

1. Crear rama (opcional):
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Desarrollar y probar

3. Commit:
   ```bash
   git add .
   git commit -m "feat: descripción de la feature"
   ```

4. Merge a main (si aplica)

---

## 📚 Documentación Relacionada

- **[GUIA_RAPIDA.md](./GUIA_RAPIDA.md)** - Inicio rápido
- **[ESTADO_SISTEMA_COMPLETADO.md](./ESTADO_SISTEMA_COMPLETADO.md)** - Estado completo
- **[SESION_TRABAJO_RESUMEN.md](./SESION_TRABAJO_RESUMEN.md)** - Resumen de la sesión
- **[README.md](./README.md)** - Documentación principal
- **[frontend-react/README.md](./frontend-react/README.md)** - Frontend docs

---

## 💡 Tips

- **Hot Reload:** El frontend se recarga automáticamente al guardar. El backend requiere restart.
- **Logs en vivo:** Usa `Receive-Job -Keep` para ver logs sin detener el job.
- **Prisma Studio:** Útil para ver/editar datos sin SQL directo.
- **Tests antes de commit:** Siempre ejecuta `node test.js` antes de commitear.
- **Credenciales seguras:** Cambiar defaults en `.env` antes de producción.

---

*Última actualización: 3 de noviembre de 2025*
