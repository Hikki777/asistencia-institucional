# 🚀 Guía Rápida de Inicio

## Scripts Optimizados del Sistema

### ✅ Iniciar Sistema (Recomendado)
```powershell
.\start-all.ps1
```

**Características:**
- ✓ Inicia backend y frontend automáticamente
- ✓ Todo en una sola terminal de VS Code (SIN ventanas externas)
- ✓ Consumo mínimo de recursos (~250MB RAM)
- ✓ Verificación automática de servicios
- ✓ Abre el navegador automáticamente
- ✓ Presiona `Ctrl+C` para detener TODO

**URLs:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

---

### 🛑 Detener Sistema
```powershell
.\stop-all.ps1
```

**Características:**
- ✓ Detiene todos los procesos Node.js
- ✓ Libera puertos 5000 y 5173
- ✓ Verificación de limpieza completa

---

## 📋 Scripts Adicionales (Uso Avanzado)

### Desarrollo con Reinicio Automático
```powershell
.\start-dev.ps1
```
Solo si necesitas que el backend se reinicie al modificar código.

### Inicio Manual por Servicio
```powershell
# Backend solo
cd backend
node server.js

# Frontend solo
cd frontend-react
npm run dev
```

---

## 🔧 Solución de Problemas

### El sistema no inicia
1. Ejecuta primero: `.\stop-all.ps1`
2. Espera 3 segundos
3. Ejecuta: `.\start-all.ps1`

### Ver logs de los servicios
```powershell
# Ver logs del backend
Receive-Job <ID del backend>

# Ver logs del frontend
Receive-Job <ID del frontend>

# Los IDs se muestran al iniciar el sistema
```

### Puerto ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr ":5000"
netstat -ano | findstr ":5173"

# O ejecuta stop-all.ps1 que limpia automáticamente
.\stop-all.ps1
```

### Muchas ventanas abiertas
- El script `start-all.ps1` NO abre ventanas externas
- Todo funciona en background dentro de VS Code
- Solo verás una terminal activa

---

## 📊 Consumo de Recursos

**Con start-all.ps1 (OPTIMIZADO):**
- 1 terminal de VS Code
- Sin ventanas externas
- ~250-300 MB RAM total
- Servicios en PowerShell Jobs (background)

**Scripts antiguos:**
- Múltiples ventanas CMD/PowerShell externas
- Múltiples terminales en VS Code
- ~600-800 MB RAM

---

## 🎯 Uso Recomendado Diario

```powershell
# 1. Al iniciar tu día
.\start-all.ps1

# 2. Trabaja normalmente
# El navegador se abre en http://localhost:5173

# 3. Al terminar
# Presiona Ctrl+C en la ventana de control
# O ejecuta: .\stop-all.ps1
```

---

## 💡 Consejos

- **Todo en VS Code** - No se abren ventanas externas
- **Ctrl+C** detiene ambos servicios limpiamente
- Si ves errores, usa `Receive-Job <ID>` para ver logs detallados
- El navegador se abre automáticamente en http://localhost:5173
- Los servicios corren en background usando PowerShell Jobs
- Consumo mínimo de recursos: solo 1 terminal

---

## 📝 Notas

- Los servicios corren en PowerShell Jobs (background silencioso)
- No se abren ventanas externas ni CMD
- Todo funciona dentro de VS Code en una sola terminal
- El sistema se detiene limpiamente con `Ctrl+C`
- Para ver logs en tiempo real: `Receive-Job -Id <ID> -Keep`
- Consumo optimizado: ~250MB RAM vs ~600MB antes

---

**Última actualización:** 5 de noviembre de 2025
