# 📖 INSTRUCCIONES PARA CONTINUAR

## Sistema: Gestión de Asistencias por QR

**Estado:** ✅ Completamente Operativo  
**Última Actualización:** 2 de Noviembre de 2025, 19:33 UTC

---

## 🚀 Cómo Iniciar el Sistema

### Opción 1: Automática (Si se implementa)
```powershell
.\run.ps1
```

### Opción 2: Manual (Recomendado mientras tanto)

**Paso 1: Abre una terminal en VS Code y ejecuta:**
```powershell
cd "c:\Users\Kevin\Documents\Proyectos\Gestión de Asistencias\asistencias-qr"
node backend/server.js
```

**Paso 2: Abre OTRA pestaña de terminal (Ctrl+Shift+`) y ejecuta:**
```powershell
cd "c:\Users\Kevin\Documents\Proyectos\Gestión de Asistencias\asistencias-qr\frontend-react"
npm run dev
```

**Paso 3: Accede a los servidores:**
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:5173

---

## 🧪 Ejecutar Pruebas

En una terminal nueva:
```powershell
npm test
```

**Resultado esperado:** 8/8 tests pasados ✅

---

## 📱 Cómo Usar el Sistema

### 1. Abrir la aplicación
Abre tu navegador en: `http://localhost:5173`

### 2. Login (Demo)
- Email: `admin@colegio.edu`
- Contraseña: `admin123`
(O usaría demo mode si está habilitado)

### 3. Funciones principales

**Dashboard:**
- Ver estado del sistema
- Estadísticas de alumnos y QR
- Última actividad

**Gestión de Alumnos:**
- Crear nuevo alumno
- Editar información
- Generar QR
- Descargar QR en PNG
- Eliminar/inactivar

**Diagnósticos:**
- Ejecutar diagnóstico del sistema
- Ver problemas detectados
- Estado automático

**Reparación:**
- Regenerar QR
- Regenerar logo
- Ver logs de operaciones

---

## 📝 Documentación Disponible

| Documento | Contenido | Ubicación |
|-----------|----------|----------|
| **README_COMPLETO.md** | Guía técnica completa | Raíz |
| **FRONTEND_REACT.md** | Documentación del frontend | Raíz |
| **DIAGNOSTICO_Y_REPARACION.md** | Problemas y soluciones | Raíz |
| **SESION_ACTUAL_RESUMEN.md** | Detalles de esta sesión | Raíz |
| **RESUMEN_FINAL_EJECUTIVO.md** | Visión general del proyecto | Raíz |
| **ESTADO_FINAL.txt** | Checklist de completitud | Raíz |

---

## 🔧 Comandos Útiles

```powershell
# Instalar dependencias (primera vez)
npm install
cd frontend-react && npm install && cd ..

# Iniciar backend
node backend/server.js

# Iniciar frontend
cd frontend-react && npm run dev

# Ejecutar tests
npm test

# Ver base de datos (Prisma Studio)
npx prisma studio

# Migrar cambios en la BD
npm run prisma:migrate dev

# Reset de la BD (desarrollo solo)
npm run prisma:reset
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to backend"
**Solución:** Verifica que `node backend/server.js` esté ejecutándose en otra terminal

### Problem: "Port 5000 already in use"
**Solución:** 
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Problem: "Port 5173 already in use"
**Solución:** 
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Problem: "Database connection error"
**Solución:**
```powershell
npm run prisma:reset
```

### Problem: "Module not found"
**Solución:**
```powershell
rm -r node_modules package-lock.json
npm install
```

---

## 📊 Estructura de Carpetas

```
asistencias-qr/
├── backend/
│   ├── server.js           ← Main Express server
│   ├── services/           ← 5 servicios
│   ├── routes/             ← 13+ endpoints
│   ├── jobs/               ← Scheduler
│   └── prisma/             ← ORM + BD
├── frontend-react/
│   ├── src/
│   │   ├── components/     ← React components
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   └── vite.config.js
├── uploads/
│   ├── qrs/                ← Generated QR codes
│   └── logos/              ← Institution logos
├── backups/                ← Auto backups
└── [documentación]
```

---

## 🔐 Variables de Entorno (.env)

```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key-here
HMAC_SECRET=your-hmac-secret
CORS_ORIGIN=*
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
```

---

## 📱 Endpoints API Principales

```
GET    /api/health                         ← Health check
GET    /api/institucion                    ← Get institution
GET    /api/alumnos                        ← List students
POST   /api/alumnos                        ← Create student
GET    /api/alumnos/:id                    ← Get student
PUT    /api/alumnos/:id                    ← Update student
DELETE /api/alumnos/:id                    ← Delete student
POST   /api/qr/generar                     ← Generate QR
GET    /api/qr/listar/todos                ← List QR codes
GET    /api/diagnostics/qrs                ← Run diagnostics
POST   /api/repair/qrs/regenerate          ← Repair QR
```

---

## 🎯 Procesos Automáticos

El sistema ejecuta automáticamente:

**Cada 6 horas (0:00, 6:00, 12:00, 18:00):**
- Diagnóstico del sistema
- Detección de QR faltantes/corruptos
- Regeneración automática
- Backup preventivo

**Diariamente a las 2 AM:**
- Backup comprimido (ZIP)
- Almacenado en `/backups`
- Histórico de 7 días

---

## 🚀 Desarrollo Adicional

### Para Agregar Nueva Ruta
1. Crear archivo en `backend/routes/`
2. Importar en `backend/server.js`
3. Usar `app.use('/api/nueva-ruta', nuevaRuta)`

### Para Agregar Nuevo Modelo BD
1. Modificar `backend/prisma/schema.prisma`
2. Ejecutar: `npm run prisma:migrate dev`

### Para Agregar Nuevo Componente React
1. Crear archivo en `frontend-react/src/components/`
2. Importar en `frontend-react/src/App.jsx`
3. Agregar ruta si es necesario

---

## 📞 Contacto y Soporte

Si encuentras problemas:
1. Revisa los logs en la terminal
2. Consulta los documentos de troubleshooting
3. Verifica que puertos 5000 y 5173 estén libres
4. Revisa la sección de FAQ en DIAGNOSTICO_Y_REPARACION.md

---

## ✅ Checklist Inicial

- [ ] Backend iniciado (`node backend/server.js`)
- [ ] Frontend iniciado (`npm run dev` en frontend-react)
- [ ] Tests pasando (`npm test` - 8/8)
- [ ] Poder acceder a http://localhost:5173
- [ ] Ver datos en dashboard
- [ ] Crear alumno de prueba
- [ ] Generar QR
- [ ] Ejecutar diagnóstico

---

## 🎓 Recursos

- **Node.js Docs:** https://nodejs.org/en/docs/
- **Express Docs:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **Prisma Docs:** https://www.prisma.io/docs/
- **Vite Docs:** https://vitejs.dev/

---

## 📈 Próximos Pasos (Futuro)

1. **Integración Biometría:** Huella digital
2. **Foto en Asistencia:** Captura de cámara
3. **Múltiples Sedes:** Multi-tenancy
4. **App Móvil:** React Native
5. **PostgreSQL:** Migración BD

---

**Gracias por usar el Sistema de Gestión de Asistencias por QR** 🎓

Versión: 2.0.0  
Última actualización: 2 de Noviembre de 2025
