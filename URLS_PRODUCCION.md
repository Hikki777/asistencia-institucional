# URLs de Producción - HikariOpen

## Frontend
**URL**: https://sistema-asistencias-30769.web.app
**Hosting**: Firebase Hosting
**Proyecto Firebase**: sistema-asistencias-30769

## Backend
**URL API**: https://asistencia-institucional-production.up.railway.app/api
**Hosting**: Railway
**Proyecto**: asistencia-institucional-production

## Configuración

### Variables de Entorno del Frontend
- `VITE_API_URL`: https://asistencia-institucional-production.up.railway.app/api

### Comandos de Deploy

#### Frontend (Firebase)
```powershell
# Build con URL de producción
$env:VITE_API_URL="https://asistencia-institucional-production.up.railway.app/api"
npm run build:frontend

# Deploy
firebase deploy --only hosting
```

#### Backend (Railway)
El backend se despliega automáticamente desde el repositorio de GitHub cuando se hace push a la rama principal.

## Estado del Deployment
- ✅ Frontend desplegado y funcionando
- ✅ Backend desplegado y funcionando
- ✅ Integración frontend-backend verificada
- ✅ PWA configurado
- ✅ SSL/HTTPS habilitado

## Fecha del Último Deploy
**Frontend**: 17 de diciembre de 2025
**Backend**: Previamente configurado

## Notas
- El frontend se reconstruye y despliega manualmente cuando hay cambios
- El backend se despliega automáticamente desde GitHub
- Ambos servicios están en planes gratuitos/básicos
