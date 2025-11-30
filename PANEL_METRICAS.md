# 📊 Panel de Métricas Visual

## Descripción General

El Panel de Métricas Visual es una interfaz completa de monitoreo en tiempo real que proporciona visibilidad total del estado y rendimiento del sistema de registro institucional.

## ✨ Características Implementadas

### 🎯 Cards de Métricas Principales

1. **Uptime del Sistema**
   - Tiempo de actividad en horas y minutos
   - Fecha y hora de inicio del servidor
   - Indicador visual verde

2. **Requests Totales**
   - Contador total de peticiones HTTP
   - Hit rate del sistema de caché
   - Indicador azul

3. **Base de Datos**
   - Total de registros (alumnos + personal)
   - Desglose individual
   - Indicador morado

4. **Memoria del Sistema**
   - RSS (Resident Set Size)
   - Heap usado
   - Indicador naranja

### 📈 Gráficos Interactivos (Recharts)

1. **Requests por Status Code (Pie Chart)**
   - 2xx: Éxitos (verde)
   - 4xx: Errores de cliente (amarillo)
   - 5xx: Errores de servidor (rojo)
   - Porcentajes visuales

2. **Uso de Memoria (Bar Chart)**
   - Heap Usado
   - Heap Total
   - RSS
   - Valores en MB

### 📋 Top 10 Endpoints

Tabla interactiva mostrando:
- Ranking de endpoints más usados
- Número de requests por endpoint
- Porcentaje del total
- Formato de ruta en monospace

### 🔄 Controles de Actualización

1. **Auto-refresh Toggle**
   - Checkbox para activar/desactivar
   - Indicador visual con icono animado
   - Muestra intervalo actual

2. **Selector de Intervalo**
   - 10 segundos
   - 30 segundos (predeterminado)
   - 60 segundos

3. **Botón de Actualización Manual**
   - Icono de refresh
   - Actualización inmediata
   - Feedback visual

4. **Botón Reset (Admin)**
   - Solo para administradores
   - Resetea todos los contadores
   - Confirmación requerida

### 📊 Estadísticas Detalladas

#### Base de Datos
- Alumnos
- Personal
- Asistencias Hoy
- QRs Vigentes
- Queries Totales
- Errores BD

#### Sistema de Caché
- Tamaño total
- Entradas activas (verde)
- Entradas expiradas (naranja)
- Hit Rate (azul)

#### Sistema
- Versión de Node.js
- Plataforma
- Heap Usado
- Heap Total
- RSS

## 🛠️ Implementación Técnica

### Backend

**Archivo**: `backend/routes/metrics.js`

```javascript
// Endpoints
GET /api/metrics          // Obtener métricas (público)
POST /api/metrics/reset   // Resetear métricas (admin, requiere JWT)

// Funciones exportadas
incrementMetric(type, key, value)  // Incrementar contadores
metrics                            // Objeto de métricas
```

**Características**:
- Contadores en memoria (se resetean al reiniciar)
- Métricas de uptime, requests, DB, caché, memoria
- Top 10 endpoints automático
- Sin autenticación para GET (público)
- Autenticación JWT para POST /reset

### Frontend

**Archivo**: `frontend-react/src/components/MetricsPanel.jsx`

**Dependencias**:
- React Hooks (useState, useEffect)
- Recharts (gráficos)
- Framer Motion (animaciones)
- React Hot Toast (notificaciones)
- Lucide Icons
- Axios

**Características**:
- Cliente Axios con interceptor JWT automático
- Auto-refresh configurable
- Gráficos responsivos
- Skeletons de carga
- Manejo de errores con toasts
- Animaciones suaves

### Navegación

**Archivo**: `frontend-react/src/App.jsx`

- Ruta: `/metricas`
- Icono: `Activity` (Lucide)
- Protegida con autenticación
- Acceso desde sidebar

**Acceso Rápido desde Dashboard**:
- Botón "Ver Métricas Detalladas" en info box
- Navegación directa con React Router

## 📱 Interfaz de Usuario

### Layout Responsivo

- **Desktop**: Grid de 4 columnas para cards
- **Tablet**: Grid de 2 columnas
- **Mobile**: Stack vertical

### Colores y Temas

- **Verde** (#10b981): Uptime, éxitos, activos
- **Azul** (#3b82f6): Requests, caché, info
- **Morado** (#8b5cf6): Base de datos
- **Naranja** (#f59e0b): Memoria, warnings
- **Rojo** (#ef4444): Errores, reset

### Animaciones

- Fade in inicial
- Scale en cards
- Slide in lateral para gráficos
- Spin condicional en icono refresh

## 🔒 Seguridad

1. **Endpoint GET público**: No requiere autenticación para facilitar monitoreo
2. **Endpoint POST protegido**: Solo administradores pueden resetear
3. **Validación de rol**: Verificación de `req.user.rol === 'admin'`
4. **Rate limiting**: Aplica el limitador global de la API

## 📊 Métricas Disponibles

### Sistema
- `uptime.hours`: Horas de actividad
- `uptime.minutes`: Minutos de actividad
- `uptime.startedAt`: Timestamp de inicio
- `system.nodeVersion`: Versión de Node.js
- `system.platform`: Plataforma del SO
- `system.memoryUsage.heapUsed`: Heap usado (MB)
- `system.memoryUsage.heapTotal`: Heap total (MB)
- `system.memoryUsage.rss`: RSS (MB)

### Requests
- `requests.total`: Total de peticiones
- `requests.byStatus['2xx']`: Requests exitosos
- `requests.byStatus['4xx']`: Errores de cliente
- `requests.byStatus['5xx']`: Errores de servidor
- `requests.topEndpoints[]`: Top 10 endpoints con count

### Base de Datos
- `database.alumnos`: Total de alumnos
- `database.personal`: Total de personal
- `database.asistenciasHoy`: Asistencias de hoy
- `database.qrsVigentes`: QRs activos
- `database.queries`: Total de queries ejecutadas
- `database.errors`: Errores de BD

### Caché
- `cache.size`: Tamaño del caché
- `cache.active`: Entradas activas
- `cache.expired`: Entradas expiradas
- `cache.hitRate`: Tasa de aciertos (%)

## 🚀 Uso

### Para Usuarios

1. **Acceder al Panel**:
   - Desde el sidebar: Click en "Métricas"
   - Desde Dashboard: Click en "Ver Métricas Detalladas"

2. **Monitorear el Sistema**:
   - Revisar cards principales para estado general
   - Analizar gráficos para tendencias
   - Verificar top endpoints para patrones de uso

3. **Configurar Auto-refresh**:
   - Activar/desactivar checkbox
   - Seleccionar intervalo deseado (10/30/60s)

4. **Actualización Manual**:
   - Click en botón "Actualizar"
   - Refresh inmediato de todas las métricas

### Para Administradores

Además de lo anterior:

5. **Resetear Métricas**:
   - Click en botón "Reset" (rojo)
   - Confirmar en diálogo
   - Todos los contadores vuelven a 0
   - Útil para iniciar nuevos períodos de análisis

## 🎯 Casos de Uso

1. **Diagnóstico de Rendimiento**:
   - Identificar endpoints lentos o problemáticos
   - Monitorear uso de memoria
   - Detectar cuellos de botella

2. **Análisis de Tráfico**:
   - Patrones de uso por endpoint
   - Distribución de status codes
   - Volumen total de requests

3. **Monitoreo de Salud**:
   - Uptime del sistema
   - Tasa de errores (4xx/5xx)
   - Errores de base de datos

4. **Optimización de Caché**:
   - Hit rate actual
   - Tamaño y eficiencia
   - Entradas expiradas vs activas

5. **Planificación de Recursos**:
   - Uso de memoria en tiempo real
   - Crecimiento de la BD
   - Carga del sistema

## ⚠️ Notas Importantes

1. **Persistencia**: Las métricas se resetean al reiniciar el servidor
2. **Rate Limiting**: El endpoint está sujeto al rate limiter global
3. **Admin Only Reset**: Solo administradores pueden resetear contadores
4. **Auto-refresh Default**: 30 segundos por defecto, activado
5. **Métricas en Memoria**: No se persisten en base de datos

## 🔮 Mejoras Futuras

- [ ] Persistencia de métricas en BD
- [ ] Exportación a CSV/PDF
- [ ] Alertas configurables
- [ ] Gráficos de tendencia histórica
- [ ] Comparación entre períodos
- [ ] Métricas de endpoints individuales
- [ ] WebSocket para updates en tiempo real
- [ ] Dashboard personalizable
- [ ] Integración con herramientas de monitoreo externas

## 📸 Capturas

El panel incluye:
- 4 cards principales con iconos coloridos
- 2 gráficos interactivos (Pie + Bar)
- Tabla top 10 endpoints
- 3 secciones de stats detallados
- Controles de refresh y reset
- Info box con instrucciones

## ✅ Estado

**✅ Completado e Integrado**

- Backend endpoint funcional
- Frontend panel completo
- Gráficos interactivos
- Auto-refresh configurado
- Reset para admins
- Navegación integrada
- Acceso rápido desde Dashboard
- Documentación completa

---

**Última actualización**: 12 de noviembre, 2025  
**Versión**: 1.0.0  
**Estado**: Producción
