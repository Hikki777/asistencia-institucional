# 🚀 Guía Rápida de Inicio

## Scripts Optimizados del Sistema

### ✅ Iniciar Sistema (Recomendado)
```powershell
.\start-all.ps1
```

**Características:**
- ✓ Inicia backend y frontend automáticamente
- ✓ Solo 3 ventanas (1 control + 2 minimizadas)
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

### Puerto ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr ":5000"
netstat -ano | findstr ":5173"

# O ejecuta stop-all.ps1 que limpia automáticamente
.\stop-all.ps1
```

### Muchas ventanas abiertas
- El script `start-all.ps1` minimiza las ventanas automáticamente
- Solo mantén abierta la ventana de control
- Presiona `Ctrl+C` en la ventana de control para cerrar todo

---

## 📊 Consumo de Recursos

**Con start-all.ps1:**
- 1 ventana de control visible
- 2 ventanas minimizadas (backend + frontend)
- ~300-400 MB RAM total

**Scripts antiguos:**
- Múltiples ventanas abiertas
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

- **NO cierres las ventanas minimizadas** (son backend y frontend)
- **Ctrl+C en ventana de control** detiene ambos servicios
- Si ves errores, revisa las **ventanas minimizadas** en la barra de tareas
- El script **verifica automáticamente** que todo funcione antes de continuar

---

## 📝 Notas

- Los logs de backend y frontend están en sus ventanas minimizadas
- El sistema se detiene limpiamente con `Ctrl+C`
- Si un servicio falla, el script lo detecta y muestra error
- Las ventanas minimizadas se pueden restaurar para ver logs detallados

---

**Última actualización:** 5 de noviembre de 2025
