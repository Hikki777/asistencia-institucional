# Script optimizado para iniciar backend y frontend en una sola ventana
# Sistema de Registro Institucional

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SISTEMA DE REGISTRO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar procesos anteriores
Write-Host "[LIMPIEZA] Deteniendo procesos anteriores..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Verificar puertos
Write-Host "[VERIFICACION] Liberando puertos 5000 y 5173..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "[INICIO] Iniciando servicios..." -ForegroundColor Green
Write-Host ""

# Iniciar backend en background
$backendPath = Join-Path $PSScriptRoot "backend"
Write-Host "[BACKEND] Iniciando en http://localhost:5000" -ForegroundColor Magenta
$backend = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '=== BACKEND ===' -ForegroundColor Magenta; node server.js" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 3

# Iniciar frontend en background
$frontendPath = Join-Path $PSScriptRoot "frontend-react"
Write-Host "[FRONTEND] Iniciando en http://localhost:5173" -ForegroundColor Cyan
$frontend = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '=== FRONTEND ===' -ForegroundColor Cyan; npm run dev" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 5

# Verificar que ambos servicios estén corriendo
Write-Host ""
Write-Host "[VERIFICACION] Comprobando servicios..." -ForegroundColor Yellow

$backendOk = $false
$frontendOk = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    $backendOk = $true
    Write-Host "  ✓ Backend: ONLINE (Puerto 5000)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Backend: ERROR" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    $frontendOk = $true
    Write-Host "  ✓ Frontend: ONLINE (Puerto 5173)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Frontend: ERROR" -ForegroundColor Red
}

Write-Host ""
if ($backendOk -and $frontendOk) {
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  ✓ SISTEMA INICIADO" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend:  http://localhost:5000" -ForegroundColor Magenta
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Las ventanas de los servicios están minimizadas." -ForegroundColor Gray
    Write-Host "Presiona Ctrl+C aquí para detener AMBOS servicios." -ForegroundColor Yellow
    Write-Host ""
    
    # Abrir navegador
    Start-Process "http://localhost:5173"
    
    # Mantener script activo y monitorear procesos
    try {
        while ($true) {
            Start-Sleep -Seconds 10
            
            # Verificar si los procesos siguen activos
            if (-not (Get-Process -Id $backend.Id -ErrorAction SilentlyContinue)) {
                Write-Host "[ERROR] Backend se detuvo inesperadamente" -ForegroundColor Red
                break
            }
            if (-not (Get-Process -Id $frontend.Id -ErrorAction SilentlyContinue)) {
                Write-Host "[ERROR] Frontend se detuvo inesperadamente" -ForegroundColor Red
                break
            }
        }
    } finally {
        Write-Host ""
        Write-Host "[LIMPIEZA] Deteniendo servicios..." -ForegroundColor Yellow
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
        Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "[LIMPIEZA] Sistema detenido" -ForegroundColor Green
    }
} else {
    Write-Host "================================" -ForegroundColor Red
    Write-Host "  ✗ ERROR AL INICIAR" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa las ventanas minimizadas para ver los errores." -ForegroundColor Yellow
    Write-Host "Presiona cualquier tecla para limpiar y salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
