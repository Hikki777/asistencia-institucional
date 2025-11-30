# 🚀 Scripts de Inicio y Monitor

## Scripts Disponibles

### 1. `start-with-monitor.ps1` (Recomendado para desarrollo)

**Inicio completo con auto-reparación y monitoreo**

```powershell
.\start-with-monitor.ps1
```

**Características:**
- ✅ Inicia backend y frontend en Jobs de PowerShell
- ✅ Monitor de salud cada 30 segundos (configurable)
- ✅ Auto-reparación si algún servicio falla
- ✅ Logs detallados en `logs/monitor.log`
- ✅ Máximo 5 reintentos por servicio
- ✅ Dashboard de estado en tiempo real

**Parámetros opcionales:**
```powershell
# Cambiar intervalo de monitoreo (en segundos)
.\start-with-monitor.ps1 -MonitorIntervalSeconds 60

# Cambiar máximo de reintentos
.\start-with-monitor.ps1 -MaxRetries 10

# Iniciar sin monitor (solo arranque)
.\start-with-monitor.ps1 -NoMonitor
```

**Para detener:** Presiona `Ctrl+C` en la terminal

---

### 2. `start-auto-simple.ps1`

**Inicio rápido sin monitor**

```powershell
.\start-auto-simple.ps1
```

**Características:**
- ⚡ Inicio rápido
- 🔇 Servicios en segundo plano
- 📋 Sin monitoreo activo
- 🎯 Ideal para pruebas rápidas

**Para detener:** Usa `stop-all.ps1`

---

### 3. `start-auto.ps1` (Original)

**Inicio con gestión de puertos**

```powershell
.\start-auto.ps1
```

**Características:**
- 🔧 Libera puertos automáticamente
- 🪟 Procesos ocultos de Windows
- ✅ Verificación de salud básica

---

### 4. `stop-all.ps1`

**Detener todos los servicios**

```powershell
.\stop-all.ps1
```

**Acciones:**
1. Detiene Jobs de PowerShell
2. Mata procesos Node.js
3. Libera puertos 5000 y 5173
4. Verifica limpieza completa

---

## 🎯 ¿Cuál usar?

| Escenario | Script Recomendado |
|-----------|-------------------|
| **Desarrollo activo con debugging** | `start-with-monitor.ps1` |
| **Producción local con supervisión** | `start-with-monitor.ps1` |
| **Pruebas rápidas** | `start-auto-simple.ps1` |
| **Primera vez / problemas de puertos** | `start-auto.ps1` |
| **Detener todo** | `stop-all.ps1` |

---

## 📊 Monitor de Salud

El script `start-with-monitor.ps1` incluye un monitor que:

### Verifica cada 30 segundos:
- ✅ Backend responde en puerto 5000
- ✅ Endpoint `/api/health` retorna `status: ok`
- ✅ Frontend responde en puerto 5173

### Si detecta fallo:
1. 🔄 Intenta reiniciar el servicio automáticamente
2. 📝 Registra el evento en `logs/monitor.log`
3. 🎯 Muestra dashboard actualizado
4. ⚠️ Alerta si se alcanza el máximo de reintentos

### Dashboard en tiempo real:

```
╔════════════════════════════════════════════════════════════════╗
║  📊 Estado del Sistema - 18:45:30                             ║
╠════════════════════════════════════════════════════════════════╣
║  Backend (5000):  🟢 ONLINE  | Uptime: 01:23:45 | Reintentos: 0  ║
║  Frontend (5173): 🟢 ONLINE  | Uptime: 01:23:40 | Reintentos: 0  ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 📋 Logs

### Monitor Log
**Ubicación:** `logs/monitor.log`

Contiene:
- Eventos de inicio/detención
- Fallos detectados
- Reintentos realizados
- Timestamps detallados

**Ejemplo:**
```
[2025-11-12 18:45:30] [INFO] Sistema iniciado correctamente
[2025-11-12 19:15:45] [ERROR] Backend no responde!
[2025-11-12 19:15:50] [WARN] Reiniciando Backend (intento 1/5)...
[2025-11-12 19:15:58] [SUCCESS] Backend recuperado exitosamente
```

---

## 🔧 Solución de Problemas

### El monitor no detecta los servicios

**Solución:**
```powershell
.\stop-all.ps1
Start-Sleep -Seconds 5
.\start-with-monitor.ps1
```

### Servicios no inician

**Verifica puertos:**
```powershell
# Ver qué está usando el puerto 5000
Get-NetTCPConnection -LocalPort 5000

# Ver qué está usando el puerto 5173
Get-NetTCPConnection -LocalPort 5173
```

**Liberar manualmente:**
```powershell
.\stop-all.ps1
```

### Demasiados reintentos

**Causas comunes:**
- 💾 Base de datos corrupta
- 📦 Dependencias faltantes
- 🔐 Permisos insuficientes
- 🌐 Puerto bloqueado por firewall

**Revisión:**
1. Ver logs: `Get-Content logs\monitor.log -Tail 50`
2. Verificar backend: `cd backend; node server.js` (ver errores)
3. Verificar frontend: `cd frontend-react; npm run dev` (ver errores)

---

## 🎓 Ejemplos de Uso

### Desarrollo normal
```powershell
# Iniciar con monitor
.\start-with-monitor.ps1

# Trabajar en el código...
# El monitor reinicia automáticamente si hay errores

# Detener cuando termines
# Presionar Ctrl+C
```

### Testing rápido
```powershell
# Inicio rápido
.\start-auto-simple.ps1

# Hacer pruebas...

# Detener
.\stop-all.ps1
```

### Producción local supervisada
```powershell
# Monitor con intervalo largo y más reintentos
.\start-with-monitor.ps1 -MonitorIntervalSeconds 60 -MaxRetries 10

# Dejar corriendo indefinidamente
# Se auto-repara ante fallos
```

---

## 💡 Tips

1. **Ver logs en vivo:**
   ```powershell
   Get-Content logs\monitor.log -Wait -Tail 20
   ```

2. **Ver Jobs activos:**
   ```powershell
   Get-Job
   ```

3. **Ver salida de un Job:**
   ```powershell
   Get-Job -Name "Backend" | Receive-Job -Keep
   Get-Job -Name "Frontend" | Receive-Job -Keep
   ```

4. **Reiniciar solo un servicio:**
   ```powershell
   # Detener job específico
   Get-Job -Name "Backend" | Stop-Job
   Get-Job -Name "Backend" | Remove-Job
   
   # Iniciar nuevamente
   .\start-with-monitor.ps1
   ```

5. **Monitoreo externo:**
   El monitor también funciona con herramientas externas:
   - Health check: `curl http://localhost:5000/api/health`
   - Métricas: `curl http://localhost:5000/api/metrics`

---

## 🔐 Seguridad

- ⚠️ Los scripts detienen TODOS los procesos Node.js en el sistema
- ⚠️ Usa solo en entorno de desarrollo
- ⚠️ Para producción, considera PM2, Docker, o servicios de Windows

---

## 📚 Recursos

- **Logs Backend:** `backend/logs/`
- **Logs Monitor:** `logs/monitor.log`
- **Health Check:** http://localhost:5000/api/health
- **Métricas:** http://localhost:5000/api/metrics
- **Frontend:** http://localhost:5173

---

**Última actualización:** 12 de noviembre, 2025
