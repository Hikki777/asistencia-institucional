# Script optimizado para iniciar backend y frontend en una sola terminal
# Sistema de Registro Institucional
# Sin ventanas externas - Todo en VS Code

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
Write-Host "[INICIO] Iniciando servicios en background..." -ForegroundColor Green
Write-Host ""

# Iniciar backend en background (sin ventana)
$backendPath = Join-Path $PSScriptRoot "backend"
Write-Host "[BACKEND] Iniciando en http://localhost:5000" -ForegroundColor Magenta

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    node server.js
} -ArgumentList $backendPath

Start-Sleep -Seconds 3

# Iniciar frontend en background (sin ventana)
$frontendPath = Join-Path $PSScriptRoot "frontend-react"
Write-Host "[FRONTEND] Iniciando en http://localhost:5173" -ForegroundColor Cyan

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $frontendPath

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
    Write-Host "  ✗ Backend: Iniciando... (puede tomar unos segundos)" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    $frontendOk = $true
    Write-Host "  ✓ Frontend: ONLINE (Puerto 5173)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Frontend: Iniciando... (puede tomar unos segundos)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  ✓ SISTEMA INICIADO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Magenta
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Los servicios están corriendo en background." -ForegroundColor Gray
Write-Host "Presiona Ctrl+C para detener AMBOS servicios." -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Ver logs:" -ForegroundColor Cyan
Write-Host "   Backend:  Receive-Job $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Frontend: Receive-Job $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""

# Abrir navegador
Start-Process "http://localhost:5173"

# Mantener script activo y monitorear jobs
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Verificar si los jobs siguen activos
        $backendState = Get-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
        $frontendState = Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
        
        if ($backendState.State -eq "Failed" -or $backendState.State -eq "Stopped") {
            Write-Host "[ERROR] Backend se detuvo inesperadamente" -ForegroundColor Red
            Write-Host "Logs del backend:" -ForegroundColor Yellow
            Receive-Job -Id $backendJob.Id
            break
        }
        if ($frontendState.State -eq "Failed" -or $frontendState.State -eq "Stopped") {
            Write-Host "[ERROR] Frontend se detuvo inesperadamente" -ForegroundColor Red
            Write-Host "Logs del frontend:" -ForegroundColor Yellow
            Receive-Job -Id $frontendJob.Id
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "[LIMPIEZA] Deteniendo servicios..." -ForegroundColor Yellow
    
    # Detener jobs
    Stop-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
    Stop-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
    
    # Limpiar procesos
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "[LIMPIEZA] Sistema detenido correctamente" -ForegroundColor Green
}
