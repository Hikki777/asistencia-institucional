# start-dev.ps1 - Inicia Backend y Frontend con auto-reload
# Este script mantiene los procesos estables durante el desarrollo

Write-Host "🚀 Iniciando Sistema de Asistencias en modo DESARROLLO..." -ForegroundColor Cyan
Write-Host "   Con auto-reload para backend y frontend" -ForegroundColor Gray
Write-Host ""

# Verificar si los puertos están en uso
$backendPort = 5000
$frontendPort = 5173

function Test-Port {
    param($port)
    $connection = New-Object System.Net.Sockets.TcpClient
    try {
        $connection.Connect("localhost", $port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Verificar backend
if (Test-Port $backendPort) {
    Write-Host "⚠️  Puerto $backendPort ya está en uso" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas detener el proceso existente? (s/n)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "🛑 Deteniendo procesos en puerto $backendPort..." -ForegroundColor Yellow
        Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
            $_.MainWindowTitle -match "backend|server"
        } | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
}

# Verificar frontend
if (Test-Port $frontendPort) {
    Write-Host "⚠️  Puerto $frontendPort ya está en uso" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas detener el proceso existente? (s/n)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "🛑 Deteniendo procesos en puerto $frontendPort..." -ForegroundColor Yellow
        Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
            $_.MainWindowTitle -match "vite|frontend"
        } | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Iniciar Backend con nodemon
Write-Host ""
Write-Host "📦 Iniciando BACKEND con nodemon (auto-reload)..." -ForegroundColor Green
Write-Host "   Puerto: $backendPort" -ForegroundColor Gray
Write-Host "   Los cambios en backend/*.js se aplicarán automáticamente" -ForegroundColor Gray
Write-Host ""

Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    `$Host.UI.RawUI.WindowTitle = '🔧 Backend - Nodemon'
    Write-Host '🔧 Backend con Nodemon - Auto-reload activado' -ForegroundColor Cyan
    Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor DarkGray
    Write-Host ''
    cd '$PWD'
    npm run dev:backend
"@

Start-Sleep -Seconds 3

# Esperar a que el backend esté listo
Write-Host "⏳ Esperando a que el backend esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    $attempt++
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$backendPort/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response) {
            $backendReady = $true
            Write-Host "✅ Backend listo en http://localhost:$backendPort" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds 1
    }
}

Write-Host ""

if (-not $backendReady) {
    Write-Host "❌ Backend no respondió a tiempo" -ForegroundColor Red
    Write-Host "   Revisa la ventana del backend para ver errores" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar de todas formas"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Iniciar Frontend con Vite
Write-Host ""
Write-Host "🎨 Iniciando FRONTEND con Vite (HMR activado)..." -ForegroundColor Cyan
Write-Host "   Puerto: $frontendPort" -ForegroundColor Gray
Write-Host "   Los cambios en frontend-react/src se aplicarán al instante" -ForegroundColor Gray
Write-Host ""

Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    `$Host.UI.RawUI.WindowTitle = '🎨 Frontend - Vite'
    Write-Host '🎨 Frontend con Vite - Hot Module Replacement (HMR)' -ForegroundColor Magenta
    Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor DarkGray
    Write-Host ''
    cd '$PWD/frontend-react'
    npm run dev
"@

Start-Sleep -Seconds 5

# Esperar a que el frontend esté listo
Write-Host "⏳ Esperando a que el frontend esté listo..." -ForegroundColor Yellow
$maxAttempts = 20
$attempt = 0
$frontendReady = $false

while ($attempt -lt $maxAttempts -and -not $frontendReady) {
    $attempt++
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$frontendPort" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response) {
            $frontendReady = $true
            Write-Host "✅ Frontend listo en http://localhost:$frontendPort" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host ""

if ($frontendReady) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✅ ¡SISTEMA INICIADO CORRECTAMENTE!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 URLs del sistema:" -ForegroundColor White
    Write-Host "   🔧 Backend:  " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:$backendPort" -ForegroundColor Yellow
    Write-Host "   🎨 Frontend: " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:$frontendPort" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Modo DESARROLLO activado:" -ForegroundColor White
    Write-Host "   • Backend con nodemon - auto-reload al guardar" -ForegroundColor Gray
    Write-Host "   • Frontend con Vite HMR - actualizaciones instantáneas" -ForegroundColor Gray
    Write-Host "   • Los cambios se aplicarán SIN necesidad de reiniciar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 Abre tu navegador en: " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:$frontendPort" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    # Intentar abrir el navegador
    Write-Host ""
    $openBrowser = Read-Host "¿Abrir en navegador? (s/n)"
    if ($openBrowser -eq 's' -or $openBrowser -eq 'S') {
        Start-Process "http://localhost:$frontendPort"
    }
} else {
    Write-Host "⚠️  Frontend tardó más de lo esperado" -ForegroundColor Yellow
    Write-Host "   Revisa la ventana del frontend para ver el progreso" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📝 Para detener el sistema, usa: " -NoNewline -ForegroundColor Gray
Write-Host ".\stop-system.ps1" -ForegroundColor Yellow
Write-Host ""
