# start-dev-simple.ps1 - Inicia Backend y Frontend sin ventanas externas
# Los procesos corren en background jobs

Write-Host "🚀 Iniciando Sistema de Asistencias en modo DESARROLLO..." -ForegroundColor Cyan
Write-Host "   Sin ventanas externas - Todo en background" -ForegroundColor Gray
Write-Host ""

$backendPort = 5000
$frontendPort = 5173

# Verificar y limpiar jobs anteriores
Write-Host "🧹 Limpiando procesos anteriores..." -ForegroundColor Yellow
Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue | Stop-Job
Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue | Remove-Job
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Iniciar Backend con nodemon
Write-Host ""
Write-Host "📦 Iniciando BACKEND con nodemon..." -ForegroundColor Green
Write-Host "   Puerto: $backendPort" -ForegroundColor Gray
Write-Host "   Auto-reload: Activado" -ForegroundColor Gray

$backendJob = Start-Job -Name Backend -ScriptBlock {
    Set-Location $using:PWD
    npm run dev:backend
}

Start-Sleep -Seconds 5

# Esperar a que el backend esté listo
Write-Host ""
Write-Host "⏳ Esperando respuesta del backend..." -ForegroundColor Yellow
$maxAttempts = 60  # Aumentado de 30 a 60 segundos
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
    Write-Host ""
    Write-Host "📋 Últimas líneas del log del backend:" -ForegroundColor Yellow
    Receive-Job -Name Backend | Select-Object -Last 15
    Write-Host ""
    $continue = Read-Host "¿Continuar con el frontend de todas formas? (s/n)"
    if ($continue -ne 's' -and $continue -ne 'S') {
        Write-Host "❌ Cancelando inicio..." -ForegroundColor Red
        Get-Job -Name Backend | Stop-Job | Remove-Job
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Iniciar Frontend con Vite
Write-Host ""
Write-Host "🎨 Iniciando FRONTEND con Vite..." -ForegroundColor Cyan
Write-Host "   Puerto: $frontendPort" -ForegroundColor Gray
Write-Host "   HMR: Activado" -ForegroundColor Gray

$frontendJob = Start-Job -Name Frontend -ScriptBlock {
    Set-Location (Join-Path $using:PWD "frontend-react")
    npm run dev
}

Start-Sleep -Seconds 5

# Esperar a que el frontend esté listo
Write-Host ""
Write-Host "⏳ Esperando respuesta del frontend..." -ForegroundColor Yellow
$maxAttempts = 40  # Aumentado de 20 a 40 segundos
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
    Write-Host "💡 Modo DESARROLLO:" -ForegroundColor White
    Write-Host "   • Backend con nodemon - reinicia automáticamente" -ForegroundColor Gray
    Write-Host "   • Frontend con Vite HMR - actualización instantánea" -ForegroundColor Gray
    Write-Host "   • Procesos corriendo en background (sin ventanas)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Ver logs:" -ForegroundColor White
    Write-Host "   • Backend:  " -NoNewline -ForegroundColor Gray
    Write-Host "Receive-Job -Name Backend -Keep" -ForegroundColor Yellow
    Write-Host "   • Frontend: " -NoNewline -ForegroundColor Gray
    Write-Host "Receive-Job -Name Frontend -Keep" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🛑 Detener sistema:" -ForegroundColor White
    Write-Host "   " -NoNewline
    Write-Host ".\stop-system.ps1" -ForegroundColor Yellow
    Write-Host "   o: " -NoNewline -ForegroundColor Gray
    Write-Host "Get-Job | Stop-Job | Remove-Job" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    # Preguntar si abrir navegador
    Write-Host ""
    $openBrowser = Read-Host "¿Abrir en navegador? (s/n)"
    if ($openBrowser -eq 's' -or $openBrowser -eq 'S') {
        Start-Process "http://localhost:$frontendPort"
    }
    
    Write-Host ""
    Write-Host "💡 Tip: Esta terminal puede cerrarse. Los procesos seguirán corriendo." -ForegroundColor Gray
    Write-Host "        Para verlos usa: " -NoNewline -ForegroundColor Gray
    Write-Host "Get-Job" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "⚠️  Frontend tardó más de lo esperado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Últimas líneas del log del frontend:" -ForegroundColor Yellow
    Receive-Job -Name Frontend | Select-Object -Last 15
    Write-Host ""
    Write-Host "💡 El frontend puede estar iniciándose aún." -ForegroundColor Gray
    Write-Host "   Verifica manualmente en: http://localhost:$frontendPort" -ForegroundColor Gray
    Write-Host ""
}
