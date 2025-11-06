# 🔧 Comandos PowerShell para el Sistema

Este documento contiene los comandos PowerShell correctos para interactuar con el sistema, evitando problemas con el mensaje "Enter proxy password".

## 🚫 Problema Común

El error `Enter proxy password for user 'seBasicParsing'` ocurre cuando se usa:
```powershell
# ❌ INCORRECTO - No usar
curl http://localhost:5000/api/health -UseBasicParsing
```

En PowerShell, `curl` es un alias de `Invoke-WebRequest`, y mezclar sintaxis causa este error.

## ✅ Soluciones

### 1. Usar `Invoke-RestMethod` (Recomendado)

```powershell
# Verificar backend
Invoke-RestMethod -Uri http://localhost:5000/api/health -Method Get

# Verificar frontend
Invoke-RestMethod -Uri http://localhost:5173 -Method Get

# Con timeout y manejo de errores
Invoke-RestMethod -Uri http://localhost:5000/api/health -Method Get -TimeoutSec 5 -ErrorAction Stop
```

### 2. Usar `Invoke-WebRequest`

```powershell
# Verificar backend (obtener todo el objeto de respuesta)
$response = Invoke-WebRequest -Uri http://localhost:5000/api/health -Method Get
$response.Content  # Ver el contenido
$response.StatusCode  # Ver el código de estado

# Verificar frontend
$response = Invoke-WebRequest -Uri http://localhost:5173 -Method Get
```

### 3. Usar funciones helper (Incluidas en el proyecto)

Primero, carga los aliases:
```powershell
. .\.powershell-aliases.ps1
```

Luego usa las funciones:
```powershell
# Verificar backend
backend-test

# Verificar frontend
frontend-test

# Ver estado completo del sistema
status
```

## 🚀 Scripts del Proyecto

### Iniciar en modo desarrollo (con auto-reload)
```powershell
.\start-dev.ps1
```
**Características:**
- Backend con nodemon (auto-reinicia al guardar)
- Frontend con Vite HMR (actualización instantánea)
- Ventanas separadas para cada servicio
- Verificación automática de disponibilidad

### Iniciar en modo normal
```powershell
.\start-system.ps1
```
**Características:**
- Inicio rápido de ambos servicios
- Verificación de disponibilidad
- Jobs en segundo plano

### Detener el sistema
```powershell
.\stop-system.ps1
```

## 📝 Comandos Útiles

### Verificar puertos en uso
```powershell
# Ver todos los procesos escuchando en puertos
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 5000,5173} | Format-Table

# Ver proceso específico en puerto 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Ver proceso específico en puerto 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess
```

### Matar procesos en puertos específicos
```powershell
# Matar proceso en puerto 5000 (backend)
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "✅ Proceso en puerto 5000 terminado" -ForegroundColor Green
}

# Matar proceso en puerto 5173 (frontend)
$process = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "✅ Proceso en puerto 5173 terminado" -ForegroundColor Green
}
```

### Ver logs de Node.js
```powershell
# Ver todos los procesos de Node
Get-Process node | Format-Table Id, ProcessName, StartTime, CPU

# Ver output de un Job específico
Receive-Job -Name Backend
Receive-Job -Name Frontend
```

## 🔍 Diagnóstico

### Script de diagnóstico completo
```powershell
# Verificar todo el sistema
Write-Host "🔍 Diagnóstico del Sistema" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "📦 Node.js:" -ForegroundColor Yellow
node --version
npm --version

# 2. Verificar puertos
Write-Host "`n🌐 Puertos en uso:" -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
$frontend = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue

if ($backend) {
    Write-Host "  ✅ Backend (5000): Activo" -ForegroundColor Green
} else {
    Write-Host "  ❌ Backend (5000): Inactivo" -ForegroundColor Red
}

if ($frontend) {
    Write-Host "  ✅ Frontend (5173): Activo" -ForegroundColor Green
} else {
    Write-Host "  ❌ Frontend (5173): Inactivo" -ForegroundColor Red
}

# 3. Verificar respuesta HTTP
Write-Host "`n🌐 Respuesta HTTP:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:5000/api/health -Method Get -TimeoutSec 2
    Write-Host "  ✅ Backend responde: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend no responde" -ForegroundColor Red
}

# 4. Verificar Jobs
Write-Host "`n⚙️ Jobs de PowerShell:" -ForegroundColor Yellow
Get-Job | Format-Table
```

## 💡 Tips

1. **Evita usar `curl` en PowerShell** - Usa `Invoke-RestMethod` o `Invoke-WebRequest`
2. **Usa el script `start-dev.ps1`** para desarrollo - tiene auto-reload configurado
3. **Carga los aliases** al inicio de tu sesión para comandos más cortos
4. **Usa `-ErrorAction Stop`** para capturar errores correctamente

## 📚 Referencias

- [Invoke-RestMethod Docs](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/invoke-restmethod)
- [Invoke-WebRequest Docs](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/invoke-webrequest)
- [Get-NetTCPConnection Docs](https://learn.microsoft.com/powershell/module/nettcpip/get-nettcpconnection)
